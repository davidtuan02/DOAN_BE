import { BaseEntity } from 'src/config/base.entity';
import { IProject } from 'src/interface/project.interface';
import { UsersProjectsEntity } from 'src/users/entities/usersProjects.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'projects' })
export class ProjectsEntity extends BaseEntity implements IProject {
  @Column()
  name: string;
  @Column()
  description: string;

  @OneToMany(
    () => UsersProjectsEntity,
    (usersProjects) => usersProjects.project,
  )
  usersIncludes: UsersProjectsEntity[];
}
