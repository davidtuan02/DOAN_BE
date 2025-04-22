import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { GoalStatus } from '../entities/goal.entity';

export class CreateGoalDto {
  @ApiProperty({
    description: 'The title of the goal',
    example: 'Increase team velocity',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the goal',
    example:
      'We aim to increase our sprint velocity by 20% by improving our development processes',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Current status of the goal',
    enum: GoalStatus,
    default: GoalStatus.NOT_STARTED,
    required: false,
  })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @ApiProperty({
    description: 'Current progress percentage (0-100)',
    example: 25,
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiProperty({
    description: 'Start date for the goal',
    example: '2023-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Due date for the goal',
    example: '2023-03-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'ID of the project this goal belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @ApiProperty({
    description: 'ID of the user who owns this goal',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
