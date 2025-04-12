import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Body,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CreateNotificationDto } from '../dto/notification.dto';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(@Request() req) {
    return this.notificationService.getUserNotifications(req.user.id);
  }

  @Get('count')
  async getUnreadCount(@Request() req) {
    return {
      count: await this.notificationService.getUnreadNotificationsCount(
        req.user.id,
      ),
    };
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Post('read-all')
  @HttpCode(204)
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteNotification(@Param('id') id: string) {
    await this.notificationService.deleteNotification(id);
  }

  // Admin only - for testing purposes
  @Post()
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    // This would normally be triggered by system events, not directly called
    const { userId, type, title, message, link, metadata } =
      createNotificationDto;

    // We would get the actual user object here
    const userMock = { id: userId } as any;

    return this.notificationService.createNotification(
      userMock,
      type,
      title,
      message,
      link,
      metadata,
    );
  }
}
