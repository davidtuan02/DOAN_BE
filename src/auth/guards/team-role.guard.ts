import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES } from '../../constants/roles-enum';
import { TEAM_ROLE } from '../../constants/team-role.enum';
import { UsersService } from '../../users/services/users.service';
import { PUBLIC_KEY } from '../../constants/key-decorator';

@Injectable()
export class TeamRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const requiredTeamRole = this.reflector.get<TEAM_ROLE>(
      'team-role',
      context.getHandler(),
    );

    const req = context.switchToHttp().getRequest<Request>();
    const { roleUser, idUser } = req;
    const teamId = req.params.teamId;

    // If user has ADMIN role globally, they always have access
    if (roleUser === ROLES.MANAGER) {
      return true;
    }

    // If no specific team role is required, allow access
    if (!requiredTeamRole || !teamId) {
      return true;
    }

    // Get user with team relationships
    const user = await this.userService.findUserById(idUser);

    // Find the user's role in the specified team
    const userTeamRelation = user.teamsIncludes.find(
      (team) => team.team.id === teamId,
    );

    if (!userTeamRelation) {
      throw new UnauthorizedException('You are not a member of this team');
    }

    const userTeamRole = userTeamRelation.role;

    // Admin team role has full access to team operations
    if (userTeamRole === TEAM_ROLE.ADMIN) {
      return true;
    }

    // Leader role can create/manage projects and tasks but not teams
    if (userTeamRole === TEAM_ROLE.LEADER) {
      // Leader cannot perform team admin actions if that's what is required
      if (requiredTeamRole === TEAM_ROLE.ADMIN) {
        throw new UnauthorizedException(
          'Only team admins can perform this action',
        );
      }
      return true;
    }

    // Member role can only create/manage their tasks
    if (userTeamRole === TEAM_ROLE.MEMBER) {
      // Members can only access member-level permissions
      if (requiredTeamRole !== TEAM_ROLE.MEMBER) {
        throw new UnauthorizedException(
          'You do not have the required team role to perform this action',
        );
      }
      return true;
    }

    if (roleUser === ROLES.MANAGER) {
      // Manager role can perform team admin actions
      if (requiredTeamRole === TEAM_ROLE.ADMIN) {
        return true;
      }
    }

    throw new UnauthorizedException('Invalid team role');
  }
}
