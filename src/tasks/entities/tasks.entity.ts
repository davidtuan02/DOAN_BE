import { STATUS_TASK } from '../../constants/status-task';
import { ProjectsEntity } from '../../projects/entities/projects.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { BoardColumnEntity } from '../../projects/entities/board-column.entity';
import { UsersEntity } from '../../users/entities/user.entity';
import { AttachmentEntity } from './attachment.entity';

@Entity({ name: 'task' })
export class TasksEntity extends BaseEntity {
  @Column()
  taskName: string;

  @Column()
  taskDescription: string;

  @Column({ type: 'enum', enum: STATUS_TASK })
  status: STATUS_TASK;

  @ManyToOne(() => UsersEntity, { nullable: true })
  @JoinColumn({
    name: 'reporter_id',
  })
  reporter: UsersEntity;

  @ManyToOne(() => ProjectsEntity, (project) => project.tasks)
  @JoinColumn({
    name: 'project_id',
  })
  project: ProjectsEntity;

  @ManyToOne(() => BoardColumnEntity, (boardColumn) => boardColumn.tasks, {
    nullable: true,
  })
  @JoinColumn({
    name: 'board_column_id',
  })
  boardColumn: BoardColumnEntity;

  @ManyToOne(() => UsersEntity, { nullable: true })
  @JoinColumn({
    name: 'assignee_id',
  })
  assignee: UsersEntity;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  priority: string;

  @Column({ nullable: true })
  storyPoints: number;

  @Column('text', { array: true, nullable: true })
  labels: string[];

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.task)
  attachments: AttachmentEntity[];
}
