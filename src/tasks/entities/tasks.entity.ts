import { STATUS_TASK } from '../../constants/status-task';
import { ProjectsEntity } from '../../projects/entities/projects.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { BoardColumnEntity } from '../../projects/entities/board-column.entity';
import { UsersEntity } from '../../users/entities/user.entity';

@Entity({ name: 'task' })
export class TasksEntity extends BaseEntity {
  @Column()
  taskName: string;

  @Column()
  taskDescription: string;

  @Column({ type: 'enum', enum: STATUS_TASK })
  status: STATUS_TASK;

  @Column()
  responsableName: string;

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
}
