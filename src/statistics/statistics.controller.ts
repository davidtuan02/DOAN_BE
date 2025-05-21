import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // ... existing code ...

  @Get('projects/:id/report')
  async getProjectReport(
    @Param('id') id: string,
    @Query('format') format: 'json' | 'pdf' | 'base64' = 'json',
    @Res() res: Response,
  ) {
    const projectId = parseInt(id);
    
    if (format === 'pdf') {
      const pdfPath = await this.statisticsService.generateProjectReport(projectId, 'pdf');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=project-report.pdf`);
      return res.sendFile(pdfPath, {}, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        // Clean up the temporary file
        fs.unlinkSync(pdfPath);
      });
    }

    if (format === 'base64') {
      const base64Data = await this.statisticsService.generateProjectReport(projectId, 'base64');
      return res.json({ data: base64Data });
    }

    const report = await this.statisticsService.generateProjectReport(projectId, 'json');
    return res.json(report);
  }
} 