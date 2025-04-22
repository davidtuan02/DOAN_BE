import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalEntity } from '../entities/goal.entity';
import { CreateGoalDto } from '../dto/create-goal.dto';
import { UpdateGoalDto } from '../dto/update-goal.dto';
import { GoalResponseDto } from '../dto/goal-response.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(GoalEntity)
    private readonly goalRepository: Repository<GoalEntity>,
  ) {}

  async create(createGoalDto: CreateGoalDto): Promise<GoalResponseDto> {
    try {
      const newGoal = this.goalRepository.create(createGoalDto);
      const savedGoal = await this.goalRepository.save(newGoal);
      return this.mapToResponseDto(savedGoal);
    } catch (error) {
      throw new BadRequestException(`Failed to create goal: ${error.message}`);
    }
  }

  async findAll(projectId?: string): Promise<GoalResponseDto[]> {
    try {
      const query = this.goalRepository
        .createQueryBuilder('goal')
        .leftJoinAndSelect('goal.project', 'project')
        .leftJoinAndSelect('goal.owner', 'owner');

      if (projectId) {
        query.where('goal.project_id = :projectId', { projectId });
      }

      const goals = await query.getMany();
      return goals.map((goal) => this.mapToResponseDto(goal));
    } catch (error) {
      throw new BadRequestException(`Failed to fetch goals: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<GoalResponseDto> {
    try {
      const goal = await this.goalRepository.findOne({
        where: { id },
        relations: ['project', 'owner'],
      });

      if (!goal) {
        throw new NotFoundException(`Goal with ID "${id}" not found`);
      }

      return this.mapToResponseDto(goal);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch goal: ${error.message}`);
    }
  }

  async update(
    id: string,
    updateGoalDto: UpdateGoalDto,
  ): Promise<GoalResponseDto> {
    try {
      // Check if the goal exists
      const existingGoal = await this.goalRepository.findOne({
        where: { id },
        relations: ['project', 'owner'],
      });

      if (!existingGoal) {
        throw new NotFoundException(`Goal with ID "${id}" not found`);
      }

      // Update the goal properties
      Object.assign(existingGoal, updateGoalDto);

      // Save the updated goal
      const updatedGoal = await this.goalRepository.save(existingGoal);
      return this.mapToResponseDto(updatedGoal);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update goal: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.goalRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Goal with ID "${id}" not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete goal: ${error.message}`);
    }
  }

  // Helper method to map GoalEntity to GoalResponseDto
  private mapToResponseDto(goal: GoalEntity): GoalResponseDto {
    return {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      status: goal.status,
      progress: Number(goal.progress), // Convert decimal to number
      startDate: goal.startDate,
      dueDate: goal.dueDate,
      projectId: goal.projectId,
      projectName: goal.project?.name || '',
      ownerId: goal.ownerId,
      ownerName: goal.owner
        ? `${goal.owner.firstName} ${goal.owner.lastName}`
        : null,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }
}
