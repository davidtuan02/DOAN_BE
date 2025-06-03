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
import { PublicAccess } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AccessLevelGuard } from '../../auth/guards/access-level.guard';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ProjectsService } from '../services/projects.service';
import { RolesGuard } from '../../auth/guards/role.guard';
import { ProjectDTO, ProjectUpdateDTO } from '../dto/project.dto';
import { AccessLevel } from '../../auth/decorators/access-level.decorator';
import { ROLES } from '../../constants/roles-enum';
import { TeamRoleGuard } from '../../auth/guards/team-role.guard';
import { TeamRole } from '../../auth/decorators/team-role.decorator';
import { TEAM_ROLE } from '../../constants/team-role.enum';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(AuthGuard, RolesGuard, AccessLevelGuard)
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  @ApiParam({
    name: 'userId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @Roles(ROLES.MANAGER)
  @Post('create/userOwner/:userId')
  public async createProject(
    @Body() body: ProjectDTO,
    @Param('userId') userId: string,
  ) {
    return await this.projectService.createProject(body, userId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @Get('all')
  public async findAllProjects() {
    return await this.projectService.findProjects();
  }

  @ApiParam({
    name: 'projectId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @Get(':projectId')
  public async findProjectById(
    @Param('projectId', new ParseUUIDPipe()) id: string,
  ) {
    return await this.projectService.findProjectById(id);
  }

  @PublicAccess()
  @Get('list/api')
  public async listApi() {
    return this.projectService.listApi();
  }

  @ApiParam({
    name: 'projectId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Put('edit/:projectId')
  public async updateProject(
    @Param('projectId', new ParseUUIDPipe()) id: string,
    @Body() body: ProjectUpdateDTO,
  ) {
    return await this.projectService.updateProject(body, id);
  }

  @ApiParam({
    name: 'projectId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Delete('delete/:projectId')
  public async deleteProject(
    @Param('projectId', new ParseUUIDPipe()) id: string,
  ) {
    return await this.projectService.deleteProject(id);
  }

  @ApiParam({
    name: 'projectId',
  })
  @ApiParam({
    name: 'teamId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Post(':projectId/assign-to-team/:teamId')
  public async assignProjectToTeam(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('teamId', new ParseUUIDPipe()) teamId: string,
  ) {
    return await this.projectService.assignProjectToTeam(projectId, teamId);
  }

  @ApiParam({
    name: 'userId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @Get('user/:userId')
  public async findProjectsByUserId(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return await this.projectService.findProjectsByUserId(userId);
  }

  @ApiParam({
    name: 'projectId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Post(':projectId/create-default-board')
  public async createDefaultBoard(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    return await this.projectService.createDefaultBoardForProject(projectId);
  }
}
