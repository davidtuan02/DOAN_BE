import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationEntity,
  NotificationType,
} from '../entities/notification.entity';
import { UsersEntity } from '../../users/entities/user.entity';

@Injectable()
export class NotificationService {
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
