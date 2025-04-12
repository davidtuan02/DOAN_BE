import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { TasksEntity } from './tasks.entity';

@Entity({ name: 'attachment' })
export class AttachmentEntity extends BaseEntity {
  @Column()
  filename: string;

  @Column()
  originalname: string;

  @Column()
  mimetype: string;

  @Column()
  path: string;

  @Column()
  size: number;

  @ManyToOne(() => TasksEntity, (task) => task.attachments)
  @JoinColumn({
    name: 'task_id',
  })
  task: TasksEntity;
}
