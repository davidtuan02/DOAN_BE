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
import {
  ApiTags,
  ApiParam,
  ApiBody,
  ApiOperation,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ProjectsService } from '../services/projects.service';
import { AccessLevel } from '../../auth/decorators/access-level.decorator';
import { AccessLevelGuard } from '../../auth/guards/access-level.guard';
import { ACCESS_LEVEL } from '../../constants';
import {
  AddProjectMemberDTO,
  AddMultipleProjectMembersDTO,
  UpdateProjectMemberDTO,
} from '../dto/project-member.dto';
import { TeamRoleGuard } from '../../auth/guards/team-role.guard';
import { TeamRole } from '../../auth/decorators/team-role.decorator';
import { TEAM_ROLE } from '../../constants/team-role.enum';

@ApiTags('Project Members')
@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectMembersController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'projectId',
  })
  @ApiOperation({ summary: 'Get all members of a project' })
  @Get(':projectId/members')
  async getProjectMembers(@Param('projectId') projectId: string) {
    return this.projectsService.getProjectMembers(projectId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'projectId',
  })
  @ApiBody({ type: AddProjectMemberDTO })
  @ApiOperation({ summary: 'Add a member to a project' })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Post(':projectId/members')
  async addMemberToProject(
    @Param('projectId') projectId: string,
    @Body() addMemberDto: AddProjectMemberDTO,
  ) {
    return this.projectsService.addMemberToProject(projectId, addMemberDto);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'projectId',
  })
  @ApiBody({ type: AddMultipleProjectMembersDTO })
  @ApiOperation({ summary: 'Add multiple members to a project' })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Post(':projectId/members/bulk')
  async addMultipleMembersToProject(
    @Param('projectId') projectId: string,
    @Body() addMembersDto: AddMultipleProjectMembersDTO,
  ) {
    return this.projectsService.addMultipleMembersToProject(
      projectId,
      addMembersDto,
    );
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'projectId',
  })
  @ApiParam({
    name: 'userId',
  })
  @ApiBody({ type: UpdateProjectMemberDTO })
  @ApiOperation({ summary: 'Update a member in a project' })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Put(':projectId/members/:userId')
  async updateProjectMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() updateDto: UpdateProjectMemberDTO,
  ) {
    return this.projectsService.updateProjectMember(
      projectId,
      userId,
      updateDto,
    );
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'projectId',
  })
  @ApiParam({
    name: 'userId',
  })
  @ApiOperation({ summary: 'Remove a member from a project' })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Delete(':projectId/members/:userId')
  async removeProjectMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    await this.projectsService.removeProjectMember(projectId, userId);
    return { message: 'Member removed successfully' };
  }
}
