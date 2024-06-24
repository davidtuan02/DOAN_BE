import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { ProjectDTO, ProjectUpdateDTO } from '../dto/project.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { AccessLevelGuard } from 'src/auth/guards/access-level.guard';
import { AccessLevelDecorator } from 'src/auth/decorators/accessLevel.decorator';

@Controller('projects')
@UseGuards(AuthGuard, RoleGuard, AccessLevelGuard)
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

  @Get(':projectId')
  public async getById(@Param('projectId') id: string): Promise<ProjectDTO> {
    return await this.projectsService.findById(id);
  }

  @AccessLevelDecorator(50)
  @Put('edit/:projectId')
  public async update(
    @Body() body: ProjectUpdateDTO,
    @Param('projectId') id: string,
  ) {
    return await this.projectsService.update(body, id);
  }

  @AccessLevelDecorator(50)
  @Delete('delete/:projectId')
  public async delete(@Param('projectId') id: string) {
    return await this.projectsService.delete(id);
  }
}
