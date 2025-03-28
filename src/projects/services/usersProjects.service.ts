import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersProjectsEntity } from '../../users/entities/usersProjects.entity';
import { UsersEntity } from '../../users/entities/user.entity';
import { ProjectsEntity } from '../entities/projects.entity';
import { ACCESS_LEVEL } from '../../constants/access-level-enum';

@Injectable()
export class UsersProjectsService {
  constructor(
    @InjectRepository(UsersProjectsEntity)
    private readonly userProjectRepository: Repository<UsersProjectsEntity>,
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    @InjectRepository(ProjectsEntity)
    private readonly projectRepository: Repository<ProjectsEntity>,
  ) {}

  async addUserToProject(
    projectId: string,
    userId: string,
    role: ACCESS_LEVEL,
  ): Promise<UsersProjectsEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if user is already in the project
    const existing = await this.userProjectRepository.findOne({
      where: { user: { id: userId }, project: { id: projectId } },
    });

    if (existing) {
      existing.accessLevel = role;
      return this.userProjectRepository.save(existing);
    }

    const userProject = this.userProjectRepository.create({
      user,
      project,
      accessLevel: role,
    });

    return this.userProjectRepository.save(userProject);
  }

  async removeUserFromProject(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const userProject = await this.userProjectRepository.findOne({
      where: { user: { id: userId }, project: { id: projectId } },
    });

    if (!userProject) {
      throw new NotFoundException(
        `User with ID ${userId} is not a member of project with ID ${projectId}`,
      );
    }

    await this.userProjectRepository.remove(userProject);
  }
}
