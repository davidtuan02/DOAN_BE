import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { AccessLevel } from '../../auth/decorators/access-level.decorator';
import { AccessLevelGuard } from '../../auth/guards/access-level.guard';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/role.guard';
import {
  AddToSprintDTO,
  AssignTaskDTO,
  MoveTaskDTO,
  TasksDTO,
  UpdateTaskDTO,
} from '../dto/tasks.dto';
import { TasksService } from '../services/tasks.service';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(AuthGuard, RolesGuard, AccessLevelGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiParam({
    name: 'projectId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @AccessLevel('DEVELOPER')
  @Post('create/:projectId')
  public async createTask(
    @Body() body: TasksDTO,
    @Param('projectId') projectId: string,
  ) {
    return this.tasksService.createTask(body, projectId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @AccessLevel('DEVELOPER')
  @Get()
  public async findAllTasks() {
    return this.tasksService.findAllTasks();
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @AccessLevel('DEVELOPER')
  @Get(':id')
  public async findTaskById(@Param('id') id: string) {
    return this.tasksService.findTaskById(id);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'projectId',
  })
  @AccessLevel('DEVELOPER')
  @Get('project/:projectId')
  public async findTasksByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findTasksByProject(projectId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @AccessLevel('DEVELOPER')
  @Put(':id')
  public async updateTask(
    @Param('id') id: string,
    @Body() body: UpdateTaskDTO,
  ) {
    return this.tasksService.updateTask(id, body);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @AccessLevel('MANTEINER')
  @Delete(':id')
  public async deleteTask(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @AccessLevel('DEVELOPER')
  @Put(':id/assign')
  public async assignTaskToUser(
    @Param('id') id: string,
    @Body() body: AssignTaskDTO,
  ) {
    return this.tasksService.assignTaskToUser(id, body.userId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @AccessLevel('DEVELOPER')
  @Put(':id/move')
  public async moveTaskToColumn(
    @Param('id') id: string,
    @Body() body: MoveTaskDTO,
  ) {
    return this.tasksService.moveTaskToColumn(id, body.columnId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @AccessLevel('DEVELOPER')
  @Put(':id/sprint')
  public async addTaskToSprint(
    @Param('id') id: string,
    @Body() body: AddToSprintDTO,
  ) {
    return this.tasksService.addTaskToSprint(id, body.sprintId);
  }
}
