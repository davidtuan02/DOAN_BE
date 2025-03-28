import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from '../../users/entities/user.entity';
import { TeamsEntity } from './teams.entity';
import { TEAM_ROLE } from '../../constants/team-role.enum';

@Entity({ name: 'users_teams' })
export class UsersTeamsEntity extends BaseEntity {
  @Column({ type: 'enum', enum: TEAM_ROLE })
  role: TEAM_ROLE;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @ManyToOne(() => UsersEntity, (user) => user.teamsIncludes)
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => TeamsEntity, (team) => team.usersIncludes)
  @JoinColumn({ name: 'team_id' })
  team: TeamsEntity;
}
