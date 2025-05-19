import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { Issue } from './issue.entity';
import { Sprint } from '../sprint/sprint.entity';
import { IssueRepository } from './issue.repository';
import { SprintRepository } from '../sprint/sprint.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Issue, Sprint])
  ],
  controllers: [IssueController],
  providers: [IssueService, IssueRepository, SprintRepository],
  exports: [IssueService]
})
export class IssueModule {} 