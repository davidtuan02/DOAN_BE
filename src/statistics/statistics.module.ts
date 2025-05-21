import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './controllers/statistics.controller';
import { StatisticsService } from './services/statistics.service';
import { ProjectsEntity } from '../projects/entities/projects.entity';
import { TasksEntity } from '../tasks/entities/tasks.entity';
import { UsersEntity } from '../users/entities/user.entity';
import { SprintEntity } from '../projects/entities/sprint.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectsEntity,
      TasksEntity,
      UsersEntity,
      SprintEntity,
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {} 