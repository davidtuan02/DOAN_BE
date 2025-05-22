import { Controller, Get, Query, UseGuards, Res, Header, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { AccessLevelGuard } from '../auth/guards/access-level.guard';
import { PublicAccess } from '../auth/decorators/public.decorator';
import { Response } from 'express';
import * as PDFDocument from 'pdfkit';

@ApiTags('Statistics')
@Controller('statistics')
@UseGuards(AuthGuard, RolesGuard, AccessLevelGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @PublicAccess()
  @Get('project-overview')
  @ApiOperation({ summary: 'Get project overview statistics' })
  @ApiResponse({ status: 200, description: 'Returns project overview statistics' })
  async getProjectOverview(
    @Query('projectId') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.statisticsService.getProjectOverview(projectId, startDate, endDate);
  }

  @PublicAccess()
  @Get('task-status')
  @ApiOperation({ summary: 'Get task status distribution' })
  @ApiResponse({ status: 200, description: 'Returns task status distribution' })
  async getTaskStatusDistribution(
    @Query('projectId') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.statisticsService.getTaskStatusDistribution(projectId, startDate, endDate);
  }

  @PublicAccess()
  @Get('user-performance')
  @ApiOperation({ summary: 'Get user performance metrics' })
  @ApiResponse({ status: 200, description: 'Returns user performance metrics' })
  async getUserPerformance(
    @Query('projectId') projectId: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.statisticsService.getUserPerformance(projectId, userId, startDate, endDate);
  }

  @PublicAccess()
  @Get('sprint-progress')
  @ApiOperation({ summary: 'Get sprint progress metrics' })
  @ApiResponse({ status: 200, description: 'Returns sprint progress metrics' })
  async getSprintProgress(
    @Query('projectId') projectId: string,
    @Query('sprintId') sprintId?: string,
  ) {
    return await this.statisticsService.getSprintProgress(projectId, sprintId);
  }

  @PublicAccess()
  @Get('time-tracking')
  @ApiOperation({ summary: 'Get time tracking statistics' })
  @ApiResponse({ status: 200, description: 'Returns time tracking statistics' })
  async getTimeTrackingStats(
    @Query('projectId') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.statisticsService.getTimeTrackingStats(projectId, startDate, endDate);
  }

  @PublicAccess()
  @Get('burndown-chart')
  @ApiOperation({ summary: 'Get burndown chart data' })
  @ApiResponse({ status: 200, description: 'Returns burndown chart data' })
  async getBurndownChart(
    @Query('projectId') projectId: string,
    @Query('sprintId') sprintId?: string,
  ) {
    return await this.statisticsService.getBurndownChart(projectId, sprintId);
  }

  @PublicAccess()
  @Get('project-report')
  @ApiOperation({ summary: 'Generate comprehensive project report' })
  @ApiResponse({ status: 200, description: 'Returns comprehensive project report' })
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename=project-report.json')
  async getProjectReport(
    @Res() res: Response,
    @Query('projectId') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const report = await this.statisticsService.generateProjectReport(projectId, startDate, endDate);
    
    // Set filename with project name and date
    const filename = `project-report-${report.reportMetadata.projectName}-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    return res.json(report);
  }

  @PublicAccess()
  @Get('project-report/base64')
  @ApiOperation({ summary: 'Get project report as base64 PDF' })
  @ApiQuery({ name: 'projectId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getProjectReportBase64(
    @Query('projectId') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const report = await this.statisticsService.generateProjectReport(
      projectId,
      startDate,
      endDate,
    );

    return new Promise((resolve, reject) => {
      try {
        // Create PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Project Report - ${report.reportMetadata.projectName}`,
            Author: 'Task Management System',
          }
        });
        const chunks: Buffer[] = [];

        // Collect PDF chunks
        doc.on('data', (chunk) => chunks.push(chunk));

        // Define colors
        const colors = {
          primary: '#1a73e8',
          secondary: '#5f6368',
          success: '#34a853',
          warning: '#fbbc04',
          danger: '#ea4335',
          lightGray: '#f8f9fa',
          darkGray: '#202124'
        };

        // Add header with logo and title
        doc.fillColor(colors.primary)
           .fontSize(24)
           .font('Helvetica-Bold')
           .text('Project Report', { align: 'center' });
        
        doc.moveDown(0.5);
        
        // Add project info section
        doc.fillColor(colors.primary)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Project Information', { underline: true });
        
        doc.moveDown(0.5);
        
        // Project info box
        doc.fillColor(colors.lightGray)
           .roundedRect(50, doc.y, 495, 100, 5)
           .fill();
        
        doc.fillColor(colors.darkGray)
           .fontSize(12)
           .font('Helvetica')
           .text(`Project ID: ${report.reportMetadata.projectId}`, 70, doc.y + 20)
           .text(`Project Name: ${report.reportMetadata.projectName}`, 70, doc.y + 40)
           .text(`Generated At: ${report.reportMetadata.generatedAt}`, 70, doc.y + 60)
           .text(`Period: ${report.reportMetadata.periodStart} to ${report.reportMetadata.periodEnd}`, 70, doc.y + 80);
        
        doc.moveDown(2);

        // Add summary statistics section
        doc.fillColor(colors.primary)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Summary Statistics', { underline: true });
        
        doc.moveDown(0.5);

        // Summary statistics box
        doc.fillColor(colors.lightGray)
           .roundedRect(50, doc.y, 495, 160, 5)
           .fill();
        
        doc.fillColor(colors.darkGray)
           .fontSize(12)
           .font('Helvetica')
           .text(`Total Tasks: ${report.summary.totalTasks}`, 70, doc.y + 20)
           .text(`Completed Tasks: ${report.summary.completedTasks}`, 70, doc.y + 40)
           .text(`In Progress Tasks: ${report.summary.inProgressTasks}`, 70, doc.y + 60)
           .text(`Total Users: ${report.summary.totalUsers}`, 70, doc.y + 80)
           .text(`Project Progress: ${report.summary.projectProgress}`, 70, doc.y + 100)
           .text(`Total Time Spent: ${report.summary.totalTimeSpent}`, 70, doc.y + 120)
           .text(`Average Time Per Task: ${report.summary.averageTimePerTask}`, 70, doc.y + 140);
        
        doc.moveDown(2);

        // Add task distribution sections
        doc.fillColor(colors.primary)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Task Distribution', { underline: true });
        
        doc.moveDown(0.5);

        // Task distribution by status
        doc.fillColor(colors.secondary)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('By Status');
        
        doc.moveDown(0.5);

        // Status distribution box
        doc.fillColor(colors.lightGray)
           .roundedRect(50, doc.y, 495, 120, 5)
           .fill();
        
        let yPos = doc.y + 20;
        Object.entries(report.taskDistribution.byStatus).forEach(([status, count]) => {
          doc.fillColor(colors.darkGray)
             .fontSize(12)
             .font('Helvetica')
             .text(`${status}: ${count} tasks`, 70, yPos);
          yPos += 20;
        });
        
        doc.moveDown(2);

        // Task distribution by priority
        doc.fillColor(colors.secondary)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('By Priority');
        
        doc.moveDown(0.5);

        // Priority distribution box
        doc.fillColor(colors.lightGray)
           .roundedRect(50, doc.y, 495, 100, 5)
           .fill();
        
        yPos = doc.y + 20;
        Object.entries(report.taskDistribution.byPriority).forEach(([priority, count]) => {
          doc.fillColor(colors.darkGray)
             .fontSize(12)
             .font('Helvetica')
             .text(`${priority}: ${count} tasks`, 70, yPos);
          yPos += 20;
        });
        
        doc.moveDown(2);

        // Add time tracking section
        doc.fillColor(colors.primary)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Time Tracking by User', { underline: true });
        
        doc.moveDown(0.5);

        // Time tracking box
        doc.fillColor(colors.lightGray)
           .roundedRect(50, doc.y, 495, 160, 5)
           .fill();
        
        yPos = doc.y + 20;
        report.timeTracking.byUser.forEach((user) => {
          doc.fillColor(colors.darkGray)
             .fontSize(12)
             .font('Helvetica-Bold')
             .text(`User ID: ${user.userId}`, 70, yPos);
          
          doc.fillColor(colors.secondary)
             .fontSize(11)
             .font('Helvetica')
             .text(`Total Time Spent: ${user.totalTimeSpent}`, 90, yPos + 15)
             .text(`Task Count: ${user.taskCount}`, 90, yPos + 30)
             .text(`Average Time Per Task: ${user.averageTimePerTask}`, 90, yPos + 45);
          
          yPos += 70;
        });

        // Add footer
        const pageCount = doc.bufferedPageRange().count;
        const startPage = doc.bufferedPageRange().start;
        for (let i = startPage; i < startPage + pageCount; i++) {
          doc.switchToPage(i);
          doc.fillColor(colors.secondary)
             .fontSize(10)
             .text(
               `Page ${i - startPage + 1} of ${pageCount}`,
               50,
               doc.page.height - 50,
               { align: 'center', width: 495 }
             );
        }

        // Handle PDF completion
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          const base64Data = pdfBuffer.toString('base64');
          
          resolve({
            data: base64Data,
            filename: `project-report-${report.reportMetadata.projectId}.pdf`,
            contentType: 'application/pdf',
          });
        });

        // Handle errors
        doc.on('error', (err) => {
          reject(err);
        });

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
} 