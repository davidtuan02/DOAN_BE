import { IsOptional, IsUUID } from 'class-validator';

export class UpdateSprintDto {
  @IsOptional()
  @IsUUID('4', { message: 'sprintId must be a UUID', each: false })
  sprintId?: string | null;
} 