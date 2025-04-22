import { ApiProperty } from '@nestjs/swagger';
import { GoalStatus } from '../entities/goal.entity';

export class GoalResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the goal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The title of the goal',
    example: 'Increase team velocity',
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the goal',
    example:
      'We aim to increase our sprint velocity by 20% by improving our development processes',
    required: false,
  })
  description: string | null;

  @ApiProperty({
    description: 'Current status of the goal',
    enum: GoalStatus,
    example: GoalStatus.IN_PROGRESS,
  })
  status: GoalStatus;

  @ApiProperty({
    description: 'Current progress percentage (0-100)',
    example: 35,
  })
  progress: number;

  @ApiProperty({
    description: 'Start date for the goal',
    example: '2023-01-01',
    required: false,
  })
  startDate: Date | null;

  @ApiProperty({
    description: 'Due date for the goal',
    example: '2023-03-31',
    required: false,
  })
  dueDate: Date | null;

  @ApiProperty({
    description: 'ID of the project this goal belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Project name',
    example: 'Marketing Campaign Project',
  })
  projectName: string;

  @ApiProperty({
    description: 'ID of the user who owns this goal',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  ownerId: string | null;

  @ApiProperty({
    description: 'Name of the goal owner',
    example: 'John Doe',
    required: false,
  })
  ownerName: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-15T00:00:00Z',
  })
  updatedAt: Date;
}
