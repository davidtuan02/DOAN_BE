import {
  Column,
  Entity,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { BoardEntity } from './board.entity';
import { TasksEntity } from '../../tasks/entities/tasks.entity';
import { ProjectsEntity } from './projects.entity';
import { SPRINT_STATUS } from '../../constants/sprint-status.enum';

@Entity({ name: 'sprints' })
export class SprintEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  goal: string;

  @Column({
    type: 'enum',
    enum: SPRINT_STATUS,
    default: SPRINT_STATUS.PLANNING,
  })
  status: SPRINT_STATUS;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @ManyToOne(() => BoardEntity, (board) => board.sprints)
  @JoinColumn({ name: 'board_id' })
  board: BoardEntity;

  @ManyToOne(() => ProjectsEntity, (project) => project.sprints)
  @JoinColumn({ name: 'project_id' })
  project: ProjectsEntity;

  @ManyToMany(() => TasksEntity)
  @JoinTable({
    name: 'sprint_tasks',
    joinColumn: { name: 'sprint_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'task_id', referencedColumnName: 'id' },
  })
  issues: TasksEntity[];
}
