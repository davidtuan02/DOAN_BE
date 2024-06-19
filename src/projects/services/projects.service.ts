import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { ProjectsEntity } from '../entities/projects.entity';
import { ProjectDTO } from '../dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectsEntity)
    private readonly projectRepository: Repository<ProjectsEntity>,
  ) {}

  public async create(body: ProjectDTO): Promise<ProjectsEntity> {
    try {
      return await this.projectRepository.save(body);
    } catch (error) {
      throw new Error(error);
    }
  }

  public async findAll(): Promise<ProjectsEntity[]> {
    try {
      return await this.projectRepository.find();
    } catch (error) {
      throw new Error(error);
    }
  }

  public async findById(id: string): Promise<ProjectsEntity> {
    try {
      return await this.projectRepository
        .createQueryBuilder('user')
        .where({ id })
        .getOne();
    } catch (error) {
      throw new Error(error);
    }
  }

  public async update(
    body: ProjectDTO,
    id: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const user: UpdateResult = await this.projectRepository.update(id, body);

      if (user.affected === 0) {
        return undefined;
      } else {
        return user;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  public async delete(id: string): Promise<DeleteResult> {
    try {
      const user: DeleteResult = await this.projectRepository.delete(id);

      if (user.affected === 0) {
        return undefined;
      } else {
        return user;
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
