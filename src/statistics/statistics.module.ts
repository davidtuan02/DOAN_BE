import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { ProjectsEntity } from '../projects/entities/projects.entity';
import { TasksEntity } from '../tasks/entities/tasks.entity';
import { SprintEntity } from '../projects/entities/sprint.entity';
import { UsersEntity } from '../users/entities/user.entity';
import { TimeTrackingModule } from '../time-tracking/time-tracking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectsEntity,
      TasksEntity,
      SprintEntity,
      UsersEntity,
    ]),
    TimeTrackingModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {} 