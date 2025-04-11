import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomFilterEntity } from '../entities/custom-filter.entity';
import { FilterCriteriaEntity } from '../entities/filter-criteria.entity';
import { ProjectsService } from './projects.service';
import {
  CreateFilterDTO,
  FilterResponseDTO,
  UpdateFilterDTO,
} from '../dto/filter.dto';
import { ErrorManager } from '../../utils/error-manager.util';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class FiltersService {
  constructor(
    @InjectRepository(CustomFilterEntity)
    private readonly filterRepository: Repository<CustomFilterEntity>,
    @InjectRepository(FilterCriteriaEntity)
    private readonly criteriaRepository: Repository<FilterCriteriaEntity>,
    private readonly projectService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  public async createFilter(body: CreateFilterDTO): Promise<FilterResponseDTO> {
    try {
      // Validate project exists
      const project = await this.projectService.findProjectById(body.projectId);
      if (!project) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'The project does not exist',
        });
      }

      // Validate user exists
      const user = await this.usersService.findUserById(body.createdBy);
      if (!user) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'The user does not exist',
        });
      }

      // Create filter
      const filter = this.filterRepository.create({
        name: body.name,
        isPublic: body.isPublic || false,
        createdBy: body.createdBy,
        project,
      });

      const savedFilter = await this.filterRepository.save(filter);

      // Create criteria if provided
      let savedCriteria: FilterCriteriaEntity[] = [];
      if (body.criteria && body.criteria.length > 0) {
        const criteriaEntities = body.criteria.map((criteriaDto) => {
          return this.criteriaRepository.create({
            field: criteriaDto.field,
            operator: criteriaDto.operator,
            value: criteriaDto.value,
            filter: savedFilter,
          });
        });

        savedCriteria = await this.criteriaRepository.save(criteriaEntities);
      }

      // Return formatted response
      return this.mapToFilterResponseDto(savedFilter, savedCriteria);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findAllFilters(): Promise<FilterResponseDTO[]> {
    try {
      const filters = await this.filterRepository.find({
        relations: ['criteria', 'project'],
      });

      return filters.map((filter) =>
        this.mapToFilterResponseDto(filter, filter.criteria),
      );
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findFilterById(id: string): Promise<FilterResponseDTO> {
    try {
      const filter = await this.filterRepository.findOne({
        where: { id },
        relations: ['criteria', 'project'],
      });

      if (!filter) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Filter with ID ${id} not found`,
        });
      }

      return this.mapToFilterResponseDto(filter, filter.criteria);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findFiltersByProject(
    projectId: string,
  ): Promise<FilterResponseDTO[]> {
    try {
      const filters = await this.filterRepository.find({
        where: { project: { id: projectId } },
        relations: ['criteria', 'project'],
      });

      return filters.map((filter) =>
        this.mapToFilterResponseDto(filter, filter.criteria),
      );
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async updateFilter(
    id: string,
    body: UpdateFilterDTO,
  ): Promise<FilterResponseDTO> {
    try {
      const filter = await this.filterRepository.findOne({
        where: { id },
        relations: ['criteria', 'project'],
      });

      if (!filter) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Filter with ID ${id} not found`,
        });
      }

      // Update basic filter properties
      if (body.name) filter.name = body.name;
      if (body.description !== undefined) filter.description = body.description;
      if (body.isPublic !== undefined) filter.isPublic = body.isPublic;
      if (body.isStarred !== undefined) filter.isStarred = body.isStarred;

      const updatedFilter = await this.filterRepository.save(filter);

      // Update criteria if provided
      if (body.criteria) {
        // First delete existing criteria
        if (filter.criteria && filter.criteria.length > 0) {
          await this.criteriaRepository.remove(filter.criteria);
        }

        // Then create new criteria
        const criteriaEntities = body.criteria.map((criteriaDto) => {
          return this.criteriaRepository.create({
            field: criteriaDto.field,
            operator: criteriaDto.operator,
            value: criteriaDto.value,
            filter: updatedFilter,
          });
        });

        const savedCriteria = await this.criteriaRepository.save(
          criteriaEntities,
        );

        return this.mapToFilterResponseDto(updatedFilter, savedCriteria);
      }

      // Reload filter with criteria
      const refreshedFilter = await this.filterRepository.findOne({
        where: { id },
        relations: ['criteria', 'project'],
      });

      return this.mapToFilterResponseDto(
        refreshedFilter,
        refreshedFilter.criteria,
      );
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async deleteFilter(id: string): Promise<void> {
    try {
      const filter = await this.filterRepository.findOne({
        where: { id },
        relations: ['criteria'],
      });

      if (!filter) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Filter with ID ${id} not found`,
        });
      }

      // Delete associated criteria first
      if (filter.criteria && filter.criteria.length > 0) {
        await this.criteriaRepository.remove(filter.criteria);
      }

      // Then delete the filter
      await this.filterRepository.remove(filter);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async toggleStarFilter(
    id: string,
    isStarred: boolean,
  ): Promise<FilterResponseDTO> {
    try {
      const filter = await this.filterRepository.findOne({
        where: { id },
        relations: ['criteria', 'project'],
      });

      if (!filter) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Filter with ID ${id} not found`,
        });
      }

      filter.isStarred = isStarred;
      const updatedFilter = await this.filterRepository.save(filter);

      return this.mapToFilterResponseDto(updatedFilter, filter.criteria);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  // Helper method to map entity to DTO
  private mapToFilterResponseDto(
    filter: CustomFilterEntity,
    criteria: FilterCriteriaEntity[],
  ): FilterResponseDTO {
    return {
      id: filter.id,
      name: filter.name,
      description: filter.description,
      isPublic: filter.isPublic,
      isStarred: filter.isStarred || false,
      createdBy: filter.createdBy,
      projectId: filter.project.id,
      createdAt: filter.createdAt,
      updatedAt: filter.updatedAt,
      criteria: criteria.map((c) => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
      })),
    };
  }
}
