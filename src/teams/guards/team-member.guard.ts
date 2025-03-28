import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { TeamsService } from '../services/teams.service';
import { RequestWithUser } from '../../interfaces/request-with-user.interface';

@Injectable()
export class TeamMemberGuard implements CanActivate {
  constructor(private readonly teamsService: TeamsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user.id;
    const teamId = request.params.id;

    if (!teamId) {
      return true;
    }

    const isMember = await this.teamsService.isUserMemberOfTeam(userId, teamId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return true;
  }
}
