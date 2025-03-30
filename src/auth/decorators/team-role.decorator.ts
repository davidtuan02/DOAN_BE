import { SetMetadata } from '@nestjs/common';
import { TEAM_ROLE } from '../../constants/team-role.enum';

export const TeamRole = (role: TEAM_ROLE) => SetMetadata('team-role', role);
