import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/role.guard';
import { CustomFilterEntity } from '../entities/custom-filter.entity';
import { CreateFilterDTO, UpdateFilterDTO } from '../dto/filter.dto';
import { FiltersService } from '../services/filters.service';

@ApiTags('Filters')
@Controller('filters')
@UseGuards(AuthGuard, RolesGuard)
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @ApiHeader({
    name: 'tasks_token',
  })
  @Post()
  public async createFilter(@Body() body: CreateFilterDTO) {
    return this.filtersService.createFilter(body);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @Get()
  public async findAllFilters() {
    return this.filtersService.findAllFilters();
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @Get(':id')
  public async findFilterById(@Param('id') id: string) {
    return this.filtersService.findFilterById(id);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'projectId',
  })
  @Get('project/:projectId')
  public async findFiltersByProject(@Param('projectId') projectId: string) {
    return this.filtersService.findFiltersByProject(projectId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @Put(':id')
  public async updateFilter(
    @Param('id') id: string,
    @Body() body: UpdateFilterDTO,
  ) {
    return this.filtersService.updateFilter(id, body);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @Delete(':id')
  public async deleteFilter(@Param('id') id: string) {
    return this.filtersService.deleteFilter(id);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @Patch(':id/star')
  public async toggleStarFilter(
    @Param('id') id: string,
    @Body() body: { isStarred: boolean },
  ) {
    return this.filtersService.toggleStarFilter(id, body.isStarred);
  }
}
