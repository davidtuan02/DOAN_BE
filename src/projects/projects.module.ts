import { Module } from '@nestjs/common';
import { ProjectsService } from './services/projects.service';
import { ProjectsController } from './controllers/projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsEntity } from './entities/projects.entity';
import { UsersProjectsService } from './services/usersProjects.service';
import { UsersService } from '../users/services/users.service';
import { UsersEntity } from '../users/entities/user.entity';
import { UsersProjectsEntity } from '../users/entities/usersProjects.entity';
import { BoardEntity } from './entities/board.entity';
import { BoardColumnEntity } from './entities/board-column.entity';
import { SprintEntity } from './entities/sprint.entity';
import { CustomColumnEntity } from './entities/custom-column.entity';
import { CustomFilterEntity } from './entities/custom-filter.entity';
import { FilterCriteriaEntity } from './entities/filter-criteria.entity';
import { ProvidersModule } from '../providers/provider.module';
import { HttpCustomService } from '../providers/http/http.service';
import { TeamsModule } from '../teams/teams.module';
import { TeamsService } from '../teams/services/teams.service';
import { TeamsEntity } from '../teams/entities/teams.entity';
import { SprintService } from './services/sprint.service';
import { SprintController } from './controllers/sprint.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectsEntity,
      UsersEntity,
      UsersProjectsEntity,
      BoardEntity,
      BoardColumnEntity,
      SprintEntity,
      CustomColumnEntity,
      CustomFilterEntity,
      FilterCriteriaEntity,
      TeamsEntity,
    ]),
    ProvidersModule,
    TeamsModule,
  ],
  providers: [
    ProjectsService,
    UsersProjectsService,
    UsersService,
    HttpCustomService,
    TeamsService,
    SprintService,
  ],
  controllers: [ProjectsController, SprintController],
  exports: [ProjectsService, SprintService, TypeOrmModule],
})
export class ProjectsModule {}
