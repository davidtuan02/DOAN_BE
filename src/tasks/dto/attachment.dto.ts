import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AttachmentDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  taskId: string;
}

export class AttachmentResponseDTO {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  path: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}
