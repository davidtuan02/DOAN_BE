import { Module, forwardRef } from '@nestjs/common';
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
import { FiltersController } from './controllers/filters.controller';
import { FiltersService } from './services/filters.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TasksModule } from '../tasks/tasks.module';
import { BoardColumnService } from './services/board-column.service';
import { BoardColumnController } from './controllers/board-column.controller';
import { ProjectMembersController } from './controllers/project-members.controller';

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
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => TasksModule),
  ],
  providers: [
    ProjectsService,
    UsersProjectsService,
    UsersService,
    HttpCustomService,
    TeamsService,
    SprintService,
    FiltersService,
    BoardColumnService,
  ],
  controllers: [
    ProjectsController,
    SprintController,
    FiltersController,
    BoardColumnController,
    ProjectMembersController,
  ],
  exports: [
    ProjectsService,
    SprintService,
    TypeOrmModule,
    FiltersService,
    BoardColumnService,
  ],
})
export class ProjectsModule {}
