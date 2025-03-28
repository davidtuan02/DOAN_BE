import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  taskId: string;
}

export class UpdateCommentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class CommentDTO {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  userId: string;
  userName?: string;
}
