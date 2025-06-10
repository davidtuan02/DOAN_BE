import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ProjectsEntity } from '../../projects/entities/projects.entity';
import { TasksEntity } from '../../tasks/entities/tasks.entity';
import { UsersEntity } from '../../users/entities/user.entity';
import { SprintEntity } from '../../projects/entities/sprint.entity';

// Define enums based on database schema
enum STATUS_TASK {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

enum PRIORITY_TASK {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(ProjectsEntity)
    private readonly projectRepository: Repository<ProjectsEntity>,
    @InjectRepository(TasksEntity)
    private readonly taskRepository: Repository<TasksEntity>,
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    @InjectRepository(SprintEntity)
    private readonly sprintRepository: Repository<SprintEntity>,
  ) {}

  async getProjectOverview(projectId: string, startDate?: string, endDate?: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['tasks'],
    });

    const dateFilter = startDate && endDate ? {
      createdAt: Between(new Date(startDate), new Date(endDate))
    } : {};

    const tasks = await this.taskRepository.find({
      where: {
        project: { id: projectId },
        ...dateFilter
      },
      relations: ['assignee']
    });

    // Get unique users from tasks
    const uniqueUsers = new Set(tasks.map(task => task.assignee?.id)).size;

    return {
      projectName: project.name,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.status === STATUS_TASK.DONE).length,
      inProgressTasks: tasks.filter(task => task.status === STATUS_TASK.IN_PROGRESS).length,
      totalUsers: uniqueUsers,
      averageTaskCompletionTime: this.calculateAverageCompletionTime(tasks),
      projectProgress: this.calculateProjectProgress(tasks),
    };
  }

  async getTaskStatusDistribution(projectId: string, startDate?: string, endDate?: string) {
    const dateFilter = startDate && endDate ? {
      createdAt: Between(new Date(startDate), new Date(endDate))
    } : {};

    const tasks = await this.taskRepository.find({
      where: {
        project: { id: projectId },
        ...dateFilter
      }
    });

    return {
      total: tasks.length,
      statusDistribution: {
        CREATED: tasks.filter(task => task.status === STATUS_TASK.CREATED).length,
        IN_PROGRESS: tasks.filter(task => task.status === STATUS_TASK.IN_PROGRESS).length,
        REVIEW: tasks.filter(task => task.status === STATUS_TASK.REVIEW).length,
        DONE: tasks.filter(task => task.status === STATUS_TASK.DONE).length,
      },
      priorityDistribution: {
        HIGH: tasks.filter(task => task.priority === PRIORITY_TASK.HIGH).length,
        MEDIUM: tasks.filter(task => task.priority === PRIORITY_TASK.MEDIUM).length,
        LOW: tasks.filter(task => task.priority === PRIORITY_TASK.LOW).length,
      }
    };
  }

  async getUserPerformance(projectId: string, userId?: string, startDate?: string, endDate?: string) {
    const dateFilter = startDate && endDate ? {
      createdAt: Between(new Date(startDate), new Date(endDate))
    } : {};

    const userFilter = userId ? { id: userId } : {};

    const users = await this.userRepository.find({
      where: userFilter,
    });

    const tasks = await this.taskRepository.find({
      where: {
        project: { id: projectId },
        ...dateFilter
      },
      relations: ['assignee'],
    });

    return users.map(user => {
      const userTasks = tasks.filter(task => task.assignee?.id === user.id);
      const completedTasks = userTasks.filter(task => task.status === STATUS_TASK.DONE);

      return {
        userId: user.id,
        userName: user.firstName + ' ' + user.lastName,
        tasksAssigned: userTasks.length,
        tasksCompleted: completedTasks.length,
        averageTaskCompletionTime: this.calculateUserAverageCompletionTime(completedTasks),
        timeSpent: this.calculateUserTimeSpent(userTasks),
      };
    });
  }

  async getSprintProgress(projectId: string, sprintId?: string) {
    let sprint: SprintEntity;
    
    if (!sprintId) {
      // If no sprintId provided, get the latest active sprint for the project
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['boards', 'boards.sprints', 'boards.sprints.issues', 'boards.sprints.issues.assignee']
      });

      if (!project || !project.boards || project.boards.length === 0) {
        throw new Error(`Project with ID ${projectId} not found or has no boards`);
      }

      // Get all sprints from all boards
      const allSprints = project.boards.flatMap(board => board.sprints || []);
      
      // Find the latest active sprint
      sprint = allSprints.find(s => s.status === 'ACTIVE') || allSprints[0];
      
      if (!sprint) {
        return {
          message: 'No sprints found for this project',
          sprintId: null,
          sprintName: null,
          totalTasks: 0,
          completedTasks: 0,
          totalStoryPoints: 0,
          completedStoryPoints: 0,
          progress: 0,
          remainingStoryPoints: 0,
          tasksByStatus: {
            CREATED: 0,
            IN_PROGRESS: 0,
            REVIEW: 0,
            DONE: 0
          }
        };
      }
    } else {
      sprint = await this.sprintRepository.findOne({
        where: { id: sprintId },
        relations: ['issues', 'issues.assignee']
      });

      if (!sprint) {
        throw new Error(`Sprint with ID ${sprintId} not found`);
      }
    }

    const tasks = sprint.issues || [];
    const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    const completedStoryPoints = tasks
      .filter(task => task.status === STATUS_TASK.DONE)
      .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

    return {
      sprintId: sprint.id,
      sprintName: sprint.name,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.status === STATUS_TASK.DONE).length,
      totalStoryPoints,
      completedStoryPoints,
      progress: totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0,
      remainingStoryPoints: totalStoryPoints - completedStoryPoints,
      tasksByStatus: {
        CREATED: tasks.filter(task => task.status === STATUS_TASK.CREATED).length,
        IN_PROGRESS: tasks.filter(task => task.status === STATUS_TASK.IN_PROGRESS).length,
        REVIEW: tasks.filter(task => task.status === STATUS_TASK.REVIEW).length,
        DONE: tasks.filter(task => task.status === STATUS_TASK.DONE).length,
      }
    };
  }

  async getTimeTrackingStats(projectId: string, startDate?: string, endDate?: string) {
    const dateFilter = startDate && endDate ? {
      createdAt: Between(new Date(startDate), new Date(endDate))
    } : {};

    const tasks = await this.taskRepository.find({
      where: {
        project: { id: projectId },
        ...dateFilter
      },
      relations: ['assignee']
    });

    const timeStats = tasks.reduce((stats: Record<string, any>, task) => {
      const timeSpent = Number(task.updatedAt.getTime() - task.createdAt.getTime());
      const assigneeId = task.assignee?.id || 'unassigned';

      if (!stats[assigneeId]) {
        stats[assigneeId] = {
          totalTimeSpent: 0,
          taskCount: 0,
          averageTimePerTask: 0
        };
      }

      stats[assigneeId].totalTimeSpent += timeSpent;
      stats[assigneeId].taskCount += 1;
      stats[assigneeId].averageTimePerTask = stats[assigneeId].totalTimeSpent / stats[assigneeId].taskCount;

      return stats;
    }, {});

    return {
      projectId,
      timeStats,
      totalTimeSpent: Object.values(timeStats).reduce((sum: number, stat: any) => sum + stat.totalTimeSpent, 0),
      averageTimePerTask: tasks.length > 0 
        ? Object.values(timeStats).reduce((sum: number, stat: any) => sum + stat.totalTimeSpent, 0) / tasks.length 
        : 0
    };
  }

  async getBurndownChart(projectId: string, sprintId?: string) {
    let sprint: SprintEntity;
    
    if (!sprintId) {
      // If no sprintId provided, get the latest active sprint for the project
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['boards', 'boards.sprints', 'boards.sprints.issues']
      });

      if (!project || !project.boards || project.boards.length === 0) {
        throw new Error(`Project with ID ${projectId} not found or has no boards`);
      }

      // Get all sprints from all boards
      const allSprints = project.boards.flatMap(board => board.sprints || []);
      
      // Find the latest active sprint
      sprint = allSprints.find(s => s.status === 'ACTIVE') || allSprints[0];
      
      if (!sprint) {
        return {
          message: 'No sprints found for this project',
          sprintId: null,
          sprintName: null,
          burndownData: [],
          totalStoryPoints: 0,
          remainingStoryPoints: 0,
          sprintStartDate: null,
          sprintEndDate: null
        };
      }
    } else {
      sprint = await this.sprintRepository.findOne({
        where: { id: sprintId },
        relations: ['issues']
      });

      if (!sprint) {
        throw new Error(`Sprint with ID ${sprintId} not found`);
      }
    }

    const tasks = sprint.issues || [];
    if (tasks.length === 0) {
      return {
        sprintId: sprint.id,
        sprintName: sprint.name,
        burndownData: [],
        totalStoryPoints: 0,
        remainingStoryPoints: 0,
        sprintStartDate: sprint.startDate,
        sprintEndDate: sprint.endDate
      };
    }

    const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    const sprintStartDate = sprint.startDate || new Date(Math.min(...tasks.map(task => task.createdAt.getTime())));
    const sprintEndDate = sprint.endDate || new Date(Math.max(...tasks.map(task => task.updatedAt.getTime())));

    // Generate daily burndown data
    const burndownData = [];
    let remainingPoints = totalStoryPoints;
    const currentDate = new Date(sprintStartDate);

    while (currentDate <= sprintEndDate) {
      const completedTasks = tasks.filter(task => 
        task.status === STATUS_TASK.DONE && 
        task.updatedAt <= currentDate
      );

      const completedPoints = completedTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
      remainingPoints = totalStoryPoints - completedPoints;

      burndownData.push({
        date: new Date(currentDate),
        remainingPoints,
        completedPoints
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      sprintId: sprint.id,
      sprintName: sprint.name,
      burndownData,
      totalStoryPoints,
      remainingStoryPoints: remainingPoints,
      sprintStartDate,
      sprintEndDate
    };
  }

  async generateProjectReport(projectId: string, startDate?: string, endDate?: string) {
    // Get project overview
    const overview = await this.getProjectOverview(projectId, startDate, endDate);
    
    // Get task status distribution
    const taskStatus = await this.getTaskStatusDistribution(projectId, startDate, endDate);
    
    // Get user performance
    const userPerformance = await this.getUserPerformance(projectId, undefined, startDate, endDate);
    
    // Get time tracking stats
    const timeTracking = await this.getTimeTrackingStats(projectId, startDate, endDate);
    
    // Get sprint progress
    const sprintProgress = await this.getSprintProgress(projectId);
    
    // Get burndown chart data
    const burndownChart = await this.getBurndownChart(projectId);

    // Calculate additional metrics
    const totalTimeSpent = timeTracking.totalTimeSpent;
    const averageTimePerTask = timeTracking.averageTimePerTask;
    const totalUsers = userPerformance.length;
    const totalTasks = overview.totalTasks;
    const completedTasks = overview.completedTasks;
    const inProgressTasks = overview.inProgressTasks;
    const projectProgress = overview.projectProgress;

    // Format dates for report
    const reportDate = new Date().toISOString();
    const periodStart = startDate ? new Date(startDate).toISOString() : null;
    const periodEnd = endDate ? new Date(endDate).toISOString() : null;

    return {
      reportMetadata: {
        generatedAt: reportDate,
        periodStart,
        periodEnd,
        projectId,
        projectName: overview.projectName
      },
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        totalUsers,
        projectProgress: `${projectProgress.toFixed(2)}%`,
        totalTimeSpent: this.formatDuration(totalTimeSpent),
        averageTimePerTask: this.formatDuration(averageTimePerTask)
      },
      taskDistribution: {
        byStatus: taskStatus.statusDistribution,
        byPriority: taskStatus.priorityDistribution
      },
      userPerformance: userPerformance.map(user => ({
        ...user,
        averageTaskCompletionTime: this.formatDuration(user.averageTaskCompletionTime),
        timeSpent: this.formatDuration(user.timeSpent)
      })),
      sprintMetrics: {
        currentSprint: sprintProgress,
        burndownChart: burndownChart
      },
      timeTracking: {
        byUser: Object.entries(timeTracking.timeStats).map(([userId, stats]) => ({
          userId,
          totalTimeSpent: this.formatDuration(stats.totalTimeSpent),
          taskCount: stats.taskCount,
          averageTimePerTask: this.formatDuration(stats.averageTimePerTask)
        }))
      }
    };
  }

  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Helper methods
  private calculateAverageCompletionTime(tasks: TasksEntity[]): number {
    const completedTasks = tasks.filter(task => task.status === STATUS_TASK.DONE);
    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      const start = new Date(task.createdAt);
      const end = new Date(task.updatedAt);
      return sum + (end.getTime() - start.getTime());
    }, 0);

    return totalTime / completedTasks.length;
  }

  private calculateProjectProgress(tasks: TasksEntity[]): number {
    if (tasks.length === 0) return 0;
    return (tasks.filter(task => task.status === STATUS_TASK.DONE).length / tasks.length) * 100;
  }

  private calculateUserAverageCompletionTime(tasks: TasksEntity[]): number {
    if (tasks.length === 0) return 0;

    const totalTime = tasks.reduce((sum, task) => {
      const start = new Date(task.createdAt);
      const end = new Date(task.updatedAt);
      return sum + (end.getTime() - start.getTime());
    }, 0);

    return totalTime / tasks.length;
  }

  private calculateUserTimeSpent(tasks: TasksEntity[]): number {
    return tasks.reduce((sum, task) => {
      const start = new Date(task.createdAt);
      const end = new Date(task.updatedAt);
      return sum + (end.getTime() - start.getTime());
    }, 0);
  }
} 