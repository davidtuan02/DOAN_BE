import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { ProjectDTO, ProjectUpdateDTO } from '../dto/project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('register')
  public async register(@Body() body: ProjectDTO): Promise<ProjectDTO> {
    return await this.projectsService.create(body);
  }

  @Get('all')
  public async getAll(): Promise<ProjectDTO[]> {
    return await this.projectsService.findAll();
  }

  @Get(':id')
  public async getById(@Param('id') id: string): Promise<ProjectDTO> {
    return await this.projectsService.findById(id);
  }

  @Put('edit/:id')
  public async update(@Body() body: ProjectUpdateDTO, @Param('id') id: string) {
    return await this.projectsService.update(body, id);
  }

  @Delete('delete/:id')
  public async delete(@Param('id') id: string) {
    return await this.projectsService.delete(id);
  }
}
