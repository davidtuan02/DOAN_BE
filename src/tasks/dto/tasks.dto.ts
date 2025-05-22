import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { STATUS_TASK } from '../../constants/status-task';
import { ProjectDTO } from '../../projects/dto/project.dto';
import { Type } from 'class-transformer';

export class TasksDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  taskName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  taskDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(STATUS_TASK)
  status: STATUS_TASK;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  reporterId: string;

  @ApiProperty()
  @IsOptional()
  project?: ProjectDTO;

  @ApiProperty()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  storyPoints?: number;

  @ApiProperty()
  @IsOptional()
  labels?: string[];

  @ApiProperty()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  parentTaskId?: string;
}

export class UpdateTaskDTO extends PartialType(TasksDTO) {}

export class AssignTaskDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}

export class MoveTaskDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  columnId: string;
}

export class AddToSprintDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sprintId?: string | null;
}

export class CreateChildTaskDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  taskName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  taskDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(STATUS_TASK)
  status: STATUS_TASK;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  reporterId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  parentTaskId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  storyPoints?: number;

  @ApiProperty()
  @IsOptional()
  labels?: string[];

  @ApiProperty()
  @IsOptional()
  dueDate?: Date;
}
