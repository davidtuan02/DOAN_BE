import { BaseEntity } from '../../config/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UsersEntity } from '../../users/entities/user.entity';

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  MENTIONED = 'MENTIONED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  SPRINT_STARTED = 'SPRINT_STARTED',
  SPRINT_ENDED = 'SPRINT_ENDED',
}

@Entity({ name: 'notification' })
export class NotificationEntity extends BaseEntity {
  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({
    name: 'user_id',
  })
  user: UsersEntity;

  @Column({ nullable: true })
  link: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
