import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationEntity,
  NotificationType,
} from '../entities/notification.entity';
import { UsersEntity } from '../../users/entities/user.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async createNotification(
    user: UsersEntity,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>,
  ): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create({
      user,
      type,
      title,
      message,
      link,
      metadata,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  /**
   * Tạo thông báo khi một issue được cập nhật
   * @param user Người nhận thông báo (người được assign)
   * @param updatedBy Người cập nhật issue
   * @param issueTitle Tiêu đề của issue
   * @param issueId ID của issue
   * @param projectId ID của project
   * @param changes Những thay đổi đã được thực hiện
   */
  async createIssueUpdatedNotification(
    user: UsersEntity,
    updatedBy: UsersEntity,
    issueTitle: string,
    issueId: string,
    projectId: string,
    changes: string[] = [],
  ): Promise<NotificationEntity> {
    this.logger.debug('=== Debug Notification ===');
    this.logger.debug('updatedBy type:', typeof updatedBy);
    this.logger.debug('updatedBy keys:', Object.keys(updatedBy));
    this.logger.debug('updatedBy full:', JSON.stringify(updatedBy, null, 2));
    this.logger.debug('user type:', typeof user);
    this.logger.debug('user keys:', Object.keys(user));
    this.logger.debug('user full:', JSON.stringify(user, null, 2));
    this.logger.debug('issueTitle:', issueTitle);

    // Bỏ qua nếu người cập nhật cũng chính là người nhận thông báo
    if (user.id === updatedBy.id) {
      return null;
    }

    // Đảm bảo luôn có tên người cập nhật
    const updaterName = updatedBy?.username || 'Someone';
    this.logger.debug('updaterName:', updaterName);
    
    const title = `Issue đã được cập nhật`;
    let message = `${updaterName} đã cập nhật issue "${issueTitle}"`;

    // Thêm chi tiết về những thay đổi nếu có
    if (changes.length > 0) {
      message += `: ${changes.join(', ')}`;
    }
    this.logger.debug('final message:', message);
    this.logger.debug('=== End Debug ===');

    // Tạo link đến issue
    const link = `/projects/${projectId}/issues/${issueId}`;

    // Metadata chứa thông tin bổ sung
    const metadata = {
      issueId,
      projectId,
      updatedBy: updatedBy?.id,
      changes,
    };

    return this.createNotification(
      user,
      NotificationType.TASK_UPDATED,
      title,
      message,
      link,
      metadata,
    );
  }

  async getUserNotifications(userId: string): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        user: { id: userId },
        isRead: false,
      },
    });
  }

  async markAsRead(notificationId: string): Promise<NotificationEntity> {
    await this.notificationRepository.update(notificationId, { isRead: true });

    return this.notificationRepository.findOne({
      where: { id: notificationId },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationRepository.delete(notificationId);
  }
}