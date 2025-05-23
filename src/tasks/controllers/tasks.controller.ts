import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { AccessLevel } from '../../auth/decorators/access-level.decorator';
import { AccessLevelGuard } from '../../auth/guards/access-level.guard';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/role.guard';
import {
  AddToSprintDTO,
  AssignTaskDTO,
  CreateChildTaskDTO,
  MoveTaskDTO,
  TasksDTO,
  UpdateTaskDTO,
} from '../dto/tasks.dto';
import { TasksService } from '../services/tasks.service';
import { TeamRoleGuard } from '../../auth/guards/team-role.guard';
import { TeamRole } from '../../auth/decorators/team-role.decorator';
import { TEAM_ROLE } from '../../constants/team-role.enum';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(AuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiParam({
    name: 'projectId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.MEMBER)
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
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.MEMBER)
  @Put(':id')
  public async updateTask(
    @Param('id') id: string,
    @Body() body: UpdateTaskDTO,
    @Req() request: any,
  ) {
    // Lấy userId của người dùng hiện tại từ token
    const userId = request.user?.id;
    return this.tasksService.updateTask(id, body, userId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
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
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.MEMBER)
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
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.MEMBER)
  @Put(':id/reporter')
  public async setTaskReporter(
    @Param('id') id: string,
    @Body() body: AssignTaskDTO,
  ) {
    return this.tasksService.setTaskReporter(id, body.userId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @Get(':id/reporter')
  public async getTaskReporter(@Param('id') id: string) {
    return this.tasksService.getTaskReporter(id);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.MEMBER)
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
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Put(':id/sprint')
  public async addTaskToSprint(
    @Param('id') id: string,
    @Body() body: AddToSprintDTO,
  ) {
    return this.tasksService.addTaskToSprint(id, body.sprintId);
  }

  @Post('/:taskId/assign/:userId')
  public async assignTask(
    @Param('taskId') taskId: string,
    @Param('userId') userId: string,
  ) {
    return await this.tasksService.assignTask(taskId, userId);
  }

  /**
   * Create a child task
   */
  @ApiHeader({
    name: 'tasks_token',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.MEMBER)
  @Post('child')
  public async createChildTask(@Body() body: CreateChildTaskDTO) {
    return this.tasksService.createChildTask(body);
  }

  /**
   * Get all child tasks for a parent task
   */
  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'parentId',
  })
  @Get(':parentId/children')
  public async getChildTasks(@Param('parentId') parentId: string) {
    return this.tasksService.getChildTasks(parentId);
  }

  /**
   * Get parent task for a child task
   */
  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'childId',
  })
  @Get(':childId/parent')
  public async getParentTask(@Param('childId') childId: string) {
    return this.tasksService.getParentTask(childId);
  }

  /**
   * Remove parent-child relationship
   */
  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'childId',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.MEMBER)
  @Delete(':childId/parent')
  public async removeParentChildRelationship(
    @Param('childId') childId: string,
  ) {
    return this.tasksService.removeParentChildRelationship(childId);
  }
}
