import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { UsersTeamsEntity } from './usersTeams.entity';
import { ITeam } from '../../interfaces/team.interface';
import { ProjectsEntity } from '../../projects/entities/projects.entity';

@Entity({ name: 'teams' })
export class TeamsEntity extends BaseEntity implements ITeam {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false })
  createdBy: string;

  @OneToMany(() => UsersTeamsEntity, (usersTeams) => usersTeams.team)
  usersIncludes: UsersTeamsEntity[];

  @OneToMany(() => ProjectsEntity, (project) => project.team)
  projects: ProjectsEntity[];
}
