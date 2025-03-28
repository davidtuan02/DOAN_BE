import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TasksEntity } from './tasks.entity';
import { UsersEntity } from '../../users/entities/user.entity';

@Entity({ name: 'comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => TasksEntity)
  @JoinColumn({ name: 'task_id' })
  task: TasksEntity;

  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @Column({ name: 'user_id' })
  userId: string;
}
