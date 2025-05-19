import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sprint } from '../sprint/sprint.entity';

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'TODO' })
  status: string;

  @ManyToOne(() => Sprint, { nullable: true })
  @JoinColumn({ name: 'sprint_id' })
  sprint: Sprint | null;

  @Column({ name: 'sprint_id', nullable: true })
  sprintId: string | null;
} 