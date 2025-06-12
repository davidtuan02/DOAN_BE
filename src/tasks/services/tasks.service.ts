import {
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectsService } from '../../projects/services/projects.service';
import { ErrorManager } from '../../utils/error-manager.util';
import { DeleteResult, Repository, UpdateResult, Not } from 'typeorm';
import { CreateChildTaskDTO, TasksDTO, UpdateTaskDTO } from '../dto/tasks.dto';
import { TasksEntity, TaskStatus } from '../entities/tasks.entity';
import { UsersService } from '../../users/services/users.service';
import { BoardColumnEntity } from '../../projects/entities/board-column.entity';
import { SprintEntity } from '../../projects/entities/sprint.entity';
import { UsersEntity } from '../../users/entities/user.entity';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { AttachmentEntity } from '../entities/attachment.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksEntity)
    private readonly taskRepository: Repository<TasksEntity>,
    @InjectRepository(BoardColumnEntity)
    private readonly boardColumnRepository: Repository<BoardColumnEntity>,
    @InjectRepository(SprintEntity)
    private readonly sprintRepository: Repository<SprintEntity>,
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepository: Repository<AttachmentEntity>,
    private readonly projectService: ProjectsService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  public async createTask(
    body: TasksDTO,
    projectId: string,
  ): Promise<TasksEntity> {
    try {
      const project = await this.projectService.findProjectById(projectId);
      if (project === undefined) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'No se ha encontrado el proyecto',
        });
      }

      // Add reporter if reporterId is provided
      let reporter = null;
      if (body.reporterId) {
        reporter = await this.usersService.findUserById(body.reporterId);
        if (!reporter) {
          throw new ErrorManager({
            type: 'NOT_FOUND',
            message: `El usuario con ID ${body.reporterId} no existe`,
          });
        }
      }

      // Check for parentTask if parentTaskId is provided
      let parentTask = null;
      if (body.parentTaskId) {
        parentTask = await this.findTaskById(body.parentTaskId);
        if (!parentTask) {
          throw new ErrorManager({
            type: 'NOT_FOUND',
            message: `La tarea padre con ID ${body.parentTaskId} no existe`,
          });
        }
      }

      // Create task with project, reporter and parent task
      const taskData = {
        ...body,
        project,
        reporter,
        parentTask,
      };

      // Convert TODO status to CREATED
      if (taskData.status === 'TODO' as any) {
        taskData.status = TaskStatus.CREATED;
      }

      return await this.taskRepository.save(taskData);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findAllTasks(): Promise<TasksEntity[]> {
    try {
      const tasks = await this.taskRepository.find({
        relations: ['project', 'boardColumn', 'assignee', 'reporter'],
      });
      if (tasks.length === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontraron tareas',
        });
      }
      return tasks;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findTaskById(id: string): Promise<TasksEntity> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id },
        relations: [
          'project',
          'boardColumn',
          'assignee',
          'reporter',
          'parentTask',
          'childTasks',
        ],
      });
      if (!task) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `La tarea con ID ${id} no existe`,
        });
      }
      return task;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findTasksByProject(projectId: string): Promise<TasksEntity[]> {
    try {
      const project = await this.projectService.findProjectById(projectId);
      const tasks = await this.taskRepository.find({
        where: { project: { id: projectId } },
        relations: ['boardColumn', 'assignee', 'reporter'],
      });
      return tasks;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async updateTask(
    id: string,
    body: UpdateTaskDTO,
    updatedByUserId?: string,
  ): Promise<TasksEntity> {
    try {
      const task = await this.findTaskById(id);

      // Convert TODO status to CREATED
      if (body.status === 'TODO' as any) {
        body.status = TaskStatus.CREATED;
      }

      // Xác định những trường đã thay đổi để thêm vào thông báo
      const changes: string[] = [];
      for (const key in body) {
        if (body[key] !== undefined && task[key] !== body[key]) {
          // Định dạng các thay đổi phù hợp
          switch (key) {
            case 'taskName':
              changes.push(`title changed to "${body[key]}"`);
              break;
            case 'status':
              changes.push(`status changed to ${body[key]}`);
              break;
            case 'priority':
              changes.push(`priority changed to ${body[key]}`);
              break;
            case 'storyPoints':
              changes.push(`story points changed to ${body[key]}`);
              break;
            case 'dueDate':
              changes.push(`due date updated`);
              break;
            case 'taskDescription':
              changes.push(`description updated`);
              break;
            default:
              changes.push(`${key} updated`);
          }
        }
      }

      // Tạo đối tượng cập nhật bằng cách merge các thuộc tính
      const updatedTask = await this.taskRepository.save({
        ...task,
        ...body,
      });

      // Tải lại task với đầy đủ relation để trả về
      const refreshedTask = await this.findTaskById(id);

      // Gửi thông báo cho người được assign nếu có và không phải người cập nhật
      if (refreshedTask.assignee && updatedByUserId) {
        try {
          // Tìm user đã thực hiện cập nhật
          const updatedByUser = await this.usersService.findUserById(
            updatedByUserId,
          );

          // Tạo thông báo cho người được assign
          await this.notificationService.createIssueUpdatedNotification(
            refreshedTask.assignee,
            updatedByUser,
            refreshedTask.taskName,
            refreshedTask.id,
            refreshedTask.project.id,
            changes,
          );
        } catch (error) {
          // Log lỗi nhưng không ảnh hưởng đến việc cập nhật task
          console.error('Error sending notification:', error.message);
        }
      }

      return refreshedTask;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async deleteTask(id: string): Promise<DeleteResult> {
    try {
      const task = await this.findTaskById(id);
      
      // Delete all attachments related to this task
      await this.attachmentRepository.delete({ task: { id: task.id } });

      // Delete all child tasks first
      if (task.childTasks && task.childTasks.length > 0) {
        for (const childTask of task.childTasks) {
          // Recursively delete child tasks
          await this.deleteTask(childTask.id);
        }
      }

      const deletedTask = await this.taskRepository.delete(id);
      if (deletedTask.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar la tarea',
        });
      }
      return deletedTask;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async assignTaskToUser(
    taskId: string,
    userId: string,
  ): Promise<TasksEntity> {
    try {
      const task = await this.findTaskById(taskId);
      const user = await this.usersService.findUserById(userId);

      task.assignee = user;
      const updatedTask = await this.taskRepository.save(task);

      // Create notification for the assigned user
      await this.notificationService.createNotification(
        user,
        NotificationType.TASK_ASSIGNED,
        `New task assigned: ${task.taskName}`,
        `You've been assigned to the task "${task.taskName}" in project "${task.project.name}"`,
        `/projects/${task.project.id}/board?taskId=${taskId}`,
        { taskId, projectId: task.project.id },
      );

      return updatedTask;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async moveTaskToColumn(
    taskId: string,
    columnId: string,
  ): Promise<TasksEntity> {
    try {
      const task = await this.findTaskById(taskId);
      const column = await this.boardColumnRepository.findOne({
        where: { id: columnId },
      });

      if (!column) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `La columna con ID ${columnId} no existe`,
        });
      }

      task.boardColumn = column;
      return await this.taskRepository.save(task);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async addTaskToSprint(
    taskId: string,
    sprintId: string | null,
  ): Promise<TasksEntity> {
    try {
      const task = await this.findTaskById(taskId);

      // Nếu sprintId là null hoặc chuỗi rỗng thì xóa task khỏi tất cả sprint
      if (!sprintId) {
        // Tìm tất cả sprint chứa task này
        const allSprints = await this.sprintRepository.find({
          relations: ['issues'],
        });

        // Lọc ra các sprint chứa task này
        const sprintsWithTask = allSprints.filter(
          (sprint) =>
            sprint.issues && sprint.issues.some((issue) => issue.id === taskId),
        );

        // Xóa task khỏi các sprint này
        for (const sprint of sprintsWithTask) {
          sprint.issues = sprint.issues.filter((issue) => issue.id !== taskId);
          await this.sprintRepository.save(sprint);
        }

        return task;
      }

      // Thêm task vào sprint chỉ định
      const sprint = await this.sprintRepository.findOne({
        where: { id: sprintId },
        relations: ['issues'],
      });

      if (!sprint) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `El sprint con ID ${sprintId} no existe`,
        });
      }

      // Khởi tạo mảng issues nếu chưa có
      if (!sprint.issues) {
        sprint.issues = [];
      }

      // Xóa task khỏi các sprint khác nếu có
      const otherSprints = await this.sprintRepository.find({
        where: { id: Not(sprintId) },
        relations: ['issues'],
      });

      for (const otherSprint of otherSprints) {
        if (
          otherSprint.issues &&
          otherSprint.issues.some((issue) => issue.id === taskId)
        ) {
          otherSprint.issues = otherSprint.issues.filter(
            (issue) => issue.id !== taskId,
          );
          await this.sprintRepository.save(otherSprint);
        }
      }

      // Thêm task vào sprint mới nếu chưa có
      if (!sprint.issues.some((issue) => issue.id === taskId)) {
        sprint.issues.push(task);
        await this.sprintRepository.save(sprint);
      }

      return task;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  /**
   * Get the reporter for a task
   */
  public async getTaskReporter(taskId: string): Promise<UsersEntity> {
    try {
      const task = await this.findTaskById(taskId);

      if (!task.reporter) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `La tarea con ID ${taskId} no tiene reportero asignado`,
        });
      }

      return task.reporter;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  /**
   * Set reporter for a task
   */
  public async setTaskReporter(
    taskId: string,
    userId: string,
  ): Promise<TasksEntity> {
    try {
      const task = await this.findTaskById(taskId);
      const user = await this.usersService.findUserById(userId);

      task.reporter = user;
      return await this.taskRepository.save(task);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  /**
   * Create a child task for a parent task
   */
  public async createChildTask(body: CreateChildTaskDTO): Promise<TasksEntity> {
    try {
      // Find the parent task
      const parentTask = await this.findTaskById(body.parentTaskId);
      if (!parentTask) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `La tarea padre con ID ${body.parentTaskId} no existe`,
        });
      }

      // Add reporter if reporterId is provided
      let reporter = null;
      if (body.reporterId) {
        reporter = await this.usersService.findUserById(body.reporterId);
        if (!reporter) {
          throw new ErrorManager({
            type: 'NOT_FOUND',
            message: `El usuario con ID ${body.reporterId} no existe`,
          });
        }
      }

      // Create child task with parent task info, project inherited from parent
      const taskData = {
        ...body,
        project: parentTask.project,
        reporter,
        parentTask,
      };

      const childTask = await this.taskRepository.save(taskData);

      // Create notification for the parent task reporter
      if (parentTask.reporter) {
        await this.notificationService.createNotification(
          parentTask.reporter,
          NotificationType.TASK_UPDATED,
          `Child task added: ${childTask.taskName}`,
          `A new child task "${childTask.taskName}" has been added to your task "${parentTask.taskName}"`,
          `/projects/${parentTask.project.id}/board?taskId=${parentTask.id}`,
          { taskId: parentTask.id, projectId: parentTask.project.id },
        );
      }

      return childTask;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  /**
   * Get all child tasks for a parent task
   */
  public async getChildTasks(parentId: string): Promise<TasksEntity[]> {
    try {
      const parentTask = await this.findTaskById(parentId);

      // Find all tasks that have this parent ID
      const childTasks = await this.taskRepository.find({
        where: { parentTask: { id: parentId } },
        relations: ['assignee', 'reporter', 'boardColumn'],
      });

      return childTasks;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  /**
   * Get parent task for a child task
   */
  public async getParentTask(childId: string): Promise<TasksEntity> {
    try {
      const childTask = await this.findTaskById(childId);

      if (!childTask.parentTask) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `La tarea con ID ${childId} no tiene una tarea padre`,
        });
      }

      // Return the parent task with full details
      return await this.findTaskById(childTask.parentTask.id);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  /**
   * Remove parent-child relationship
   */
  public async removeParentChildRelationship(
    childId: string,
  ): Promise<TasksEntity> {
    try {
      const childTask = await this.findTaskById(childId);

      if (!childTask.parentTask) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: `La tarea con ID ${childId} no tiene una tarea padre`,
        });
      }

      // Store parent reference for notification
      const parentTask = childTask.parentTask;

      // Remove parent relationship
      childTask.parentTask = null;
      const updatedTask = await this.taskRepository.save(childTask);

      // Create notification for the parent task reporter
      if (parentTask && parentTask.reporter) {
        await this.notificationService.createNotification(
          parentTask.reporter,
          NotificationType.TASK_UPDATED,
          `Child task removed: ${childTask.taskName}`,
          `The child task "${childTask.taskName}" has been removed from your task "${parentTask.taskName}"`,
          `/projects/${parentTask.project.id}/board?taskId=${parentTask.id}`,
          { taskId: parentTask.id, projectId: parentTask.project.id },
        );
      }

      return updatedTask;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  /**
   * Assign a task to a user - used by the new endpoints
   */
  public async assignTask(
    taskId: string,
    userId: string,
  ): Promise<TasksEntity> {
    // Reuse the existing method to maintain notification logic
    return this.assignTaskToUser(taskId, userId);
  }
}
