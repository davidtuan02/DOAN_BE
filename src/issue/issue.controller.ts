import { Controller, Put, Param, Body, ValidationPipe } from '@nestjs/common';
import { IssueService } from './issue.service';
import { Issue } from './issue.entity';
import { UpdateSprintDto } from './dto/update-sprint.dto';

@Controller('tasks')
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Put(':id/sprint')
  async moveIssueToSprint(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) updateSprintDto: UpdateSprintDto
  ): Promise<Issue> {
    return this.issueService.moveIssueToSprint(id, updateSprintDto.sprintId);
  }
} 