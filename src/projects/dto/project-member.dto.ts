import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ACCESS_LEVEL } from '../../constants';

export class AddProjectMemberDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: ACCESS_LEVEL })
  @IsEnum(ACCESS_LEVEL)
  @IsNotEmpty()
  accessLevel: ACCESS_LEVEL;
}

export class AddMultipleProjectMembersDTO {
  @ApiProperty({ type: [AddProjectMemberDTO] })
  @IsArray()
  members: AddProjectMemberDTO[];
}

export class UpdateProjectMemberDTO {
  @ApiProperty({ enum: ACCESS_LEVEL })
  @IsEnum(ACCESS_LEVEL)
  accessLevel: ACCESS_LEVEL;
}

export class ProjectMemberResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  accessLevel: ACCESS_LEVEL;
  createdAt: Date;
  updatedAt: Date;
}
