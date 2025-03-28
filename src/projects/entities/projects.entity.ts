import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { IProject } from '../../interfaces/project.interface';
import { BaseEntity } from '../../config/base.entity';
import { UsersProjectsEntity } from '../../users/entities/usersProjects.entity';
import { TasksEntity } from '../../tasks/entities/tasks.entity';
import { PROJECT_TYPE } from '../../constants/project-type.enum';
import { TeamsEntity } from '../../teams/entities/teams.entity';
import { BoardEntity } from './board.entity';
import { CustomColumnEntity } from './custom-column.entity';
import { CustomFilterEntity } from './custom-filter.entity';

@Entity({ name: 'projects' })
export class ProjectsEntity extends BaseEntity implements IProject {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ unique: true, length: 10 })
  key: string;

  @Column({
    type: 'enum',
    enum: PROJECT_TYPE,
    default: PROJECT_TYPE.SCRUM,
  })
  projectType: PROJECT_TYPE;

  @ManyToOne(() => TeamsEntity, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team: TeamsEntity;

  @OneToMany(
    () => UsersProjectsEntity,
    (usersProjects) => usersProjects.project,
  )
  usersIncludes: UsersProjectsEntity[];

  @OneToMany(() => TasksEntity, (tasks) => tasks.project)
  tasks: TasksEntity[];

  @OneToMany(() => BoardEntity, (board) => board.project)
  boards: BoardEntity[];

  @OneToMany(() => CustomColumnEntity, (column) => column.project)
  customColumns: CustomColumnEntity[];

  @OneToMany(() => CustomFilterEntity, (filter) => filter.project)
  customFilters: CustomFilterEntity[];
}
