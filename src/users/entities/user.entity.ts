import { Column, Entity, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ROLES } from '../../constants/roles-enum';
import { IUser } from '../../interfaces/user.interface';
import { BaseEntity } from '../../config/base.entity';
import { UsersProjectsEntity } from './usersProjects.entity';
import { UsersTeamsEntity } from '../../teams/entities/usersTeams.entity';

@Entity({ name: 'users' })
export class UsersEntity extends BaseEntity implements IUser {
  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'enum', enum: ROLES, default: ROLES.BASIC })
  role: ROLES;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ nullable: true })
  resetTokenExpiry?: Date;

  @OneToMany(() => UsersProjectsEntity, (usersProjects) => usersProjects.user)
  projectsIncludes: UsersProjectsEntity[];

  @OneToMany(() => UsersTeamsEntity, (usersTeams) => usersTeams.user)
  teamsIncludes: UsersTeamsEntity[];
}
