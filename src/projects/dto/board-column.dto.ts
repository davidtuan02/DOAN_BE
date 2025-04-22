import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsHexColor,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardColumnDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  order: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  boardId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty()
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateBoardColumnDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty()
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class ReorderBoardColumnsDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  boardId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ type: [Object] })
  columnOrders: { id: string; order: number }[];
}
