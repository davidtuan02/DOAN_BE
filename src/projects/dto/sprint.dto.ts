import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SPRINT_STATUS } from '../../constants/sprint-status.enum';

export class CreateSprintDto {
  @ApiProperty({
    description: 'Project ID',
  })
  @IsNotEmpty()
  @IsUUID()
  project_id: string;

  @ApiProperty({
    description: 'Sprint name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Sprint goal',
    required: false,
  })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiProperty({
    description: 'Sprint start date',
    required: false,
  })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    description: 'Sprint end date',
    required: false,
  })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @ApiProperty({
    description: 'Sprint status',
    enum: SPRINT_STATUS,
    default: SPRINT_STATUS.PLANNING,
  })
  @IsOptional()
  @IsEnum(SPRINT_STATUS)
  status?: SPRINT_STATUS;
}

export class UpdateSprintDto {
  @ApiProperty({
    description: 'Sprint name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Sprint goal',
    required: false,
  })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiProperty({
    description: 'Sprint start date',
    required: false,
  })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    description: 'Sprint end date',
    required: false,
  })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @ApiProperty({
    description: 'Sprint status',
    enum: SPRINT_STATUS,
    required: false,
  })
  @IsOptional()
  @IsEnum(SPRINT_STATUS)
  status?: SPRINT_STATUS;
}
