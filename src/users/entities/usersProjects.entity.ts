import { BaseEntity } from 'src/config/base.entity';
import { ACCESS_LEVEL } from 'src/constants/roles';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersEntity } from './user.entity';
import { ProjectsEntity } from 'src/projects/entities/projects.entity';

@Entity({ name: 'users_projects' })
export class UsersProjectsEntity extends BaseEntity {
  @Column({ type: 'enum', enum: ACCESS_LEVEL })
  accessLevel: ACCESS_LEVEL;

  @ManyToOne(() => UsersEntity, (user) => user.projectsIncludes)
  user: UsersEntity;

  @ManyToOne(() => ProjectsEntity, (project) => project.usersIncludes)
  project: ProjectsEntity;
}
