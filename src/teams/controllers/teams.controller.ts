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
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TeamsService } from '../services/teams.service';
import {
  CreateTeamDto,
  UpdateTeamDto,
  AddMemberToTeamDto,
  UpdateMemberRoleDto,
} from '../dto/team.dto';
import { ApiTags } from '@nestjs/swagger';
import { PublicAccess } from '../../auth/decorators/public.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ROLES } from '../../constants/roles-enum';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { UserActiveGuard } from '../../auth/guards/user-active.guard';
import { RequestWithUser } from '../../interfaces/request-with-user.interface';
import { TeamMemberGuard } from '../guards/team-member.guard';
import { TeamLeaderGuard } from '../guards/team-leader.guard';
import { TeamRoleGuard } from '../../auth/guards/team-role.guard';
import { TeamRole } from '../../auth/decorators/team-role.decorator';
import { TEAM_ROLE } from '../../constants/team-role.enum';

@ApiTags('Teams')
@Controller('teams')
@UseGuards(AuthGuard, UserActiveGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(ROLES.ADMIN)
  async createTeam(@Body() body: CreateTeamDto, @Req() req: RequestWithUser) {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException(
          'User not authenticated or missing user ID',
        );
      }

      return await this.teamsService.createTeam(req.user.id, body);
    } catch (error) {
      console.error('Error creating team:', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error.message || 'An error occurred while creating the team',
      );
    }
  }

  @Get()
  getAllTeams() {
    return this.teamsService.getAllTeams();
  }

  @Get('my-teams')
  getMyTeams(@Req() req: RequestWithUser) {
    return this.teamsService.getTeamsByUserId(req.user.id);
  }

  @Get(':id')
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.MEMBER)
  getTeamById(@Param('id') id: string) {
    return this.teamsService.getTeamById(id);
  }

  @Put(':id')
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  updateTeam(@Param('id') id: string, @Body() body: UpdateTeamDto) {
    return this.teamsService.updateTeam(id, body);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN)
  deleteTeam(@Param('id') id: string) {
    return this.teamsService.deleteTeam(id);
  }

  @Post(':id/members')
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  addMemberToTeam(
    @Param('id') teamId: string,
    @Body() body: AddMemberToTeamDto,
  ) {
    return this.teamsService.addMemberToTeam(teamId, body);
  }

  @Put(':id/members/:userId/role')
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.ADMIN)
  updateMemberRole(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
    @Body() body: UpdateMemberRoleDto,
  ) {
    return this.teamsService.updateMemberRole(teamId, userId, body);
  }

  @Delete(':id/members/:userId')
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  removeMemberFromTeam(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
  ) {
    return this.teamsService.removeMemberFromTeam(teamId, userId);
  }

  @Get(':id/members')
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.MEMBER)
  getTeamMembers(@Param('id') teamId: string) {
    return this.teamsService.getTeamMembers(teamId);
  }

  @Get(':id/validate-access')
  async validateTeamAccess(
    @Param('id') teamId: string,
    @Req() req: RequestWithUser,
  ) {
    const isMember = await this.teamsService.isUserMemberOfTeam(
      req.user.id,
      teamId,
    );
    const role = await this.teamsService.getUserRoleInTeam(req.user.id, teamId);

    return {
      hasAccess: isMember,
      role,
    };
  }

  @Get(':id/available-users')
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  async getAvailableUsers(@Param('id') teamId: string) {
    return await this.teamsService.getAvailableUsersForTeam(teamId);
  }

  @Get(':id/projects')
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.MEMBER)
  getTeamProjects(@Param('id') teamId: string) {
    return this.teamsService.getTeamProjects(teamId);
  }
}
