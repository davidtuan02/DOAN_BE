import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './services/teams.service';
import { TeamsController } from './controllers/teams.controller';
import { TeamsEntity } from './entities/teams.entity';
import { UsersTeamsEntity } from './entities/usersTeams.entity';
import { UsersEntity } from '../users/entities/user.entity';
import { TeamMemberGuard } from './guards/team-member.guard';
import { TeamLeaderGuard } from './guards/team-leader.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamsEntity, UsersTeamsEntity, UsersEntity]),
  ],
  providers: [TeamsService, TeamMemberGuard, TeamLeaderGuard],
  controllers: [TeamsController],
  exports: [TeamsService, TypeOrmModule],
})
export class TeamsModule {}
