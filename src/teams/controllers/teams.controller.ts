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

@ApiTags('Teams')
@Controller('teams')
@UseGuards(AuthGuard, UserActiveGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  async createTeam(@Body() body: CreateTeamDto, @Req() req: RequestWithUser) {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException(
          'User not authenticated or missing user ID',
        );
      }

      console.log('Creating team with user ID:', req.user.id);
      console.log('Request body:', body);

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
  @UseGuards(TeamMemberGuard)
  getTeamById(@Param('id') id: string) {
    return this.teamsService.getTeamById(id);
  }

  @Put(':id')
  @UseGuards(TeamLeaderGuard)
  updateTeam(@Param('id') id: string, @Body() body: UpdateTeamDto) {
    return this.teamsService.updateTeam(id, body);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN)
  deleteTeam(@Param('id') id: string) {
    return this.teamsService.deleteTeam(id);
  }

  @Post(':id/members')
  @UseGuards(TeamLeaderGuard)
  addMemberToTeam(
    @Param('id') teamId: string,
    @Body() body: AddMemberToTeamDto,
  ) {
    return this.teamsService.addMemberToTeam(teamId, body);
  }

  @Put(':id/members/:userId/role')
  @UseGuards(TeamLeaderGuard)
  updateMemberRole(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
    @Body() body: UpdateMemberRoleDto,
  ) {
    return this.teamsService.updateMemberRole(teamId, userId, body);
  }

  @Delete(':id/members/:userId')
  @UseGuards(TeamLeaderGuard)
  removeMemberFromTeam(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
  ) {
    return this.teamsService.removeMemberFromTeam(teamId, userId);
  }

  @Get(':id/members')
  @UseGuards(TeamMemberGuard)
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
  @UseGuards(TeamLeaderGuard)
  async getAvailableUsers(@Param('id') teamId: string) {
    return await this.teamsService.getAvailableUsersForTeam(teamId);
  }

  @Get(':id/projects')
  @UseGuards(TeamMemberGuard)
  getTeamProjects(@Param('id') teamId: string) {
    return this.teamsService.getTeamProjects(teamId);
  }
}
