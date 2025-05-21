import { Controller, Get, Query, UseGuards, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatisticsService } from '../services/statistics.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/role.guard';
import { AccessLevelGuard } from '../../auth/guards/access-level.guard';
import { PublicAccess } from '../../auth/decorators/public.decorator';
import { Response } from 'express';

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
} 