import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ROLES } from '../../constants/roles-enum';
import { ProjectsEntity } from '../../projects/entities/projects.entity';
import { UsersEntity } from '../entities/user.entity';
import { ACCESS_LEVEL } from '../../constants';

export class UserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  age: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ROLES)
  role: ROLES;
}

export class UserUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ROLES)
  role?: ROLES;

  @ApiProperty()
  @IsOptional()
  @IsString()
  resetToken?: string;

  @ApiProperty()
  @IsOptional()
  resetTokenExpiry?: Date;
}

export class UserToProjectDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  user: UsersEntity;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  project: ProjectsEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ACCESS_LEVEL)
  accessLevel: ACCESS_LEVEL;
}
