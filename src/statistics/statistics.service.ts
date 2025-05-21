import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { Sprint } from '../sprints/entities/sprint.entity';
import { User } from '../users/entities/user.entity';
import { TimeTracking } from '../time-tracking/entities/time-tracking.entity';
import * as PDFDocument from 'pdfkit';
import * as htmlPdf from 'html-pdf-node';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TimeTracking)
    private timeTrackingRepository: Repository<TimeTracking>,
  ) {}

  // ... existing code ...

  async generateProjectReport(projectId: number, format: 'json' | 'pdf' | 'base64' = 'json') {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['tasks', 'sprints', 'members'],
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const reportData = {
      projectOverview: await this.getProjectOverview(projectId),
      taskStatusDistribution: await this.getTaskStatusDistribution(projectId),
      userPerformance: await this.getUserPerformance(projectId),
      sprintProgress: await this.getSprintProgress(projectId),
      timeTrackingStats: await this.getTimeTrackingStats(projectId),
      burndownChart: await this.generateBurndownChart(projectId),
    };

    switch (format) {
      case 'pdf':
        return this.generatePdfReport(reportData, project);
      case 'base64':
        return this.generateBase64Report(reportData, project);
      default:
        return reportData;
    }
  }

  private async generatePdfReport(reportData: any, project: Project) {
    const doc = new PDFDocument();
    const pdfPath = path.join(process.cwd(), 'temp', `${project.name}-report.pdf`);
    
    // Ensure temp directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'temp'));
    }

    // Create write stream
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Add content to PDF
    doc.fontSize(25).text(`Project Report: ${project.name}`, { align: 'center' });
    doc.moveDown();

    // Project Overview
    doc.fontSize(16).text('Project Overview');
    doc.fontSize(12).text(`Total Tasks: ${reportData.projectOverview.totalTasks}`);
    doc.text(`Completed Tasks: ${reportData.projectOverview.completedTasks}`);
    doc.text(`Completion Rate: ${reportData.projectOverview.completionRate}%`);
    doc.moveDown();

    // Task Status Distribution
    doc.fontSize(16).text('Task Status Distribution');
    Object.entries(reportData.taskStatusDistribution).forEach(([status, count]) => {
      doc.fontSize(12).text(`${status}: ${count}`);
    });
    doc.moveDown();

    // User Performance
    doc.fontSize(16).text('User Performance');
    reportData.userPerformance.forEach(user => {
      doc.fontSize(12).text(`${user.username}: ${user.completedTasks} tasks completed`);
    });
    doc.moveDown();

    // Sprint Progress
    doc.fontSize(16).text('Sprint Progress');
    reportData.sprintProgress.forEach(sprint => {
      doc.fontSize(12).text(`Sprint ${sprint.name}: ${sprint.completionRate}% complete`);
    });
    doc.moveDown();

    // Time Tracking Stats
    doc.fontSize(16).text('Time Tracking Statistics');
    doc.fontSize(12).text(`Total Time Spent: ${reportData.timeTrackingStats.totalTimeSpent} hours`);
    doc.text(`Average Time per Task: ${reportData.timeTrackingStats.averageTimePerTask} hours`);
    doc.moveDown();

    // Finalize PDF
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve(pdfPath);
      });
      stream.on('error', reject);
    });
  }

  private async generateBase64Report(reportData: any, project: Project) {
    const pdfPath = await this.generatePdfReport(reportData, project);
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64String = pdfBuffer.toString('base64');
    
    // Clean up temporary file
    fs.unlinkSync(pdfPath);
    
    return base64String;
  }
} 