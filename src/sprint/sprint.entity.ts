import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Issue } from '../issue/issue.entity';

@Entity('sprints')
export class Sprint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @OneToMany(() => Issue, issue => issue.sprint)
  issues: Issue[];
} 