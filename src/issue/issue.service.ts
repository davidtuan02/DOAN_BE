import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IssueRepository } from './issue.repository';
import { SprintRepository } from '../sprint/sprint.repository';
import { Issue } from './issue.entity';

@Injectable()
export class IssueService {
  constructor(
    private readonly issueRepository: IssueRepository,
    private readonly sprintRepository: SprintRepository
  ) {}

  async moveIssueToSprint(issueId: string, sprintId: string | null): Promise<Issue> {
    const issue = await this.issueRepository.findOne({
      where: { id: issueId },
      relations: ['sprint']
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${issueId} not found`);
    }

    // Handle moving to backlog
    if (sprintId === null || sprintId === undefined || sprintId === '') {
      issue.sprint = null;
      issue.sprintId = null;
      return this.issueRepository.save(issue);
    }

    // Handle moving to sprint
    try {
      const sprint = await this.sprintRepository.findOne({
        where: { id: sprintId }
      });
      
      if (!sprint) {
        throw new NotFoundException(`Sprint with ID ${sprintId} not found`);
      }
      
      issue.sprint = sprint;
      issue.sprintId = sprintId;
      return this.issueRepository.save(issue);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid sprint ID format');
    }
  }
} 