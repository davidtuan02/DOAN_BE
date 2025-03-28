import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { STATUS_TASK } from '../../constants/status-task';
import { ProjectDTO } from '../../projects/dto/project.dto';

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
  @IsString()
  responsableName: string;

  @ApiProperty()
  @IsOptional()
  project?: ProjectDTO;
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
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  sprintId: string;
}
