import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectsEntity } from '../../projects/entities/projects.entity';
import { UsersEntity } from '../../users/entities/user.entity';

// Goal status enum
export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  AT_RISK = 'AT_RISK',
}

@Entity('goals')
export class GoalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.NOT_STARTED,
  })
  status: GoalStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  // Project that this goal belongs to
  @ManyToOne(() => ProjectsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectsEntity;

  @Column({ name: 'project_id' })
  projectId: string;

  // Owner of this goal (usually a team lead or manager)
  @ManyToOne(() => UsersEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: UsersEntity;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
