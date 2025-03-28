import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TEAM_ROLE } from '../../constants/team-role.enum';

export class CreateTeamDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AddMemberToTeamDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsEnum(TEAM_ROLE)
  role: TEAM_ROLE;
}

export class UpdateMemberRoleDto {
  @IsNotEmpty()
  @IsEnum(TEAM_ROLE)
  role: TEAM_ROLE;
}
