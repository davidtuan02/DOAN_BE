import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { FILTER_OPERATOR } from '../../constants/filter-operator.enum';

export class FilterCriteriaDTO {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsNotEmpty()
  operator: FILTER_OPERATOR;

  @IsNotEmpty()
  value: any;
}

export class CreateFilterDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsBoolean()
  @IsOptional()
  isStarred?: boolean;

  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsArray()
  @IsOptional()
  criteria?: FilterCriteriaDTO[];
}

export class UpdateFilterDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsBoolean()
  @IsOptional()
  isStarred?: boolean;

  @IsArray()
  @IsOptional()
  criteria?: FilterCriteriaDTO[];
}

export class FilterResponseDTO {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isStarred: boolean;
  createdBy: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  criteria: FilterCriteriaDTO[];
}
