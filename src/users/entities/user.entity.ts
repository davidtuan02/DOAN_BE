import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ROLES } from '../../constants/roles-enum';
import { IUser } from '../../interfaces/user.interface';
import { BaseEntity } from '../../config/base.entity';
import { UsersProjectsEntity } from './usersProjects.entity';
import { UsersTeamsEntity } from '../../teams/entities/usersTeams.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: ROLES,
    default: ROLES.BASIC
  })
  role: ROLES;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => UsersProjectsEntity, (userProject) => userProject.user)
  projects: UsersProjectsEntity[];

  @OneToMany(() => UsersTeamsEntity, (userTeam) => userTeam.user)
  teams: UsersTeamsEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity({ name: 'users' })
export class UsersEntity extends BaseEntity implements IUser {
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column()
  age: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

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
