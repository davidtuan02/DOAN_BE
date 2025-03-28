import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { TeamsService } from '../services/teams.service';
import { RequestWithUser } from '../../interfaces/request-with-user.interface';
import { TEAM_ROLE } from '../../constants/team-role.enum';

@Injectable()
export class TeamLeaderGuard implements CanActivate {
  constructor(private readonly teamsService: TeamsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user.id;
    const teamId = request.params.id;

    if (!teamId) {
      return true;
    }

    const role = await this.teamsService.getUserRoleInTeam(userId, teamId);

    if (!role || (role !== TEAM_ROLE.LEADER && role !== TEAM_ROLE.ADMIN)) {
      throw new ForbiddenException(
        'Only team leaders or admins can perform this action',
      );
    }

    return true;
  }
}
