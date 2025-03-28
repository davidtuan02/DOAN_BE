import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/role.guard';
import { AccessLevelGuard } from '../../auth/guards/access-level.guard';
import { AccessLevel } from '../../auth/decorators/access-level.decorator';
import { SprintService } from '../services/sprint.service';
import { CreateSprintDto, UpdateSprintDto } from '../dto/sprint.dto';

@ApiTags('Sprints')
@Controller('sprints')
@UseGuards(AuthGuard, RolesGuard, AccessLevelGuard)
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  @ApiParam({
    name: 'boardId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @AccessLevel('DEVELOPER')
  @Post('create/:boardId')
  public async createSprint(
    @Body() body: CreateSprintDto,
    @Param('boardId', new ParseUUIDPipe()) boardId: string,
  ) {
    return await this.sprintService.createSprint(body, boardId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @Get('all')
  public async findAllSprints() {
    return await this.sprintService.findAllSprints();
  }

  @ApiParam({
    name: 'sprintId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @Get(':sprintId')
  public async findSprintById(
    @Param('sprintId', new ParseUUIDPipe()) id: string,
  ) {
    return await this.sprintService.findSprintById(id);
  }

  @ApiParam({
    name: 'boardId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @Get('board/:boardId')
  public async findSprintsByBoardId(
    @Param('boardId', new ParseUUIDPipe()) boardId: string,
  ) {
    return await this.sprintService.findSprintsByBoardId(boardId);
  }

  @ApiParam({
    name: 'projectId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @Get('project/:projectId')
  public async findSprintsByProjectId(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    return await this.sprintService.findSprintsByProjectId(projectId);
  }

  @ApiParam({
    name: 'sprintId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @AccessLevel('DEVELOPER')
  @Put(':sprintId')
  public async updateSprint(
    @Param('sprintId', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateSprintDto,
  ) {
    return await this.sprintService.updateSprint(id, body);
  }

  @ApiParam({
    name: 'sprintId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @AccessLevel('MANTEINER')
  @Delete(':sprintId')
  public async deleteSprint(
    @Param('sprintId', new ParseUUIDPipe()) id: string,
  ) {
    return await this.sprintService.deleteSprint(id);
  }

  @ApiParam({
    name: 'sprintId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @AccessLevel('DEVELOPER')
  @Put(':sprintId/start')
  public async startSprint(@Param('sprintId', new ParseUUIDPipe()) id: string) {
    return await this.sprintService.startSprint(id);
  }

  @ApiParam({
    name: 'sprintId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @AccessLevel('DEVELOPER')
  @Put(':sprintId/complete')
  public async completeSprint(
    @Param('sprintId', new ParseUUIDPipe()) id: string,
  ) {
    return await this.sprintService.completeSprint(id);
  }
}
