import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SprintEntity } from '../entities/sprint.entity';
import { BoardEntity } from '../entities/board.entity';
import { ProjectsEntity } from '../entities/projects.entity';
import { CreateSprintDto, UpdateSprintDto } from '../dto/sprint.dto';
import { SPRINT_STATUS } from '../../constants/sprint-status.enum';

@Injectable()
export class SprintService {
  constructor(
    @InjectRepository(SprintEntity)
    private readonly sprintRepository: Repository<SprintEntity>,
    @InjectRepository(BoardEntity)
    private readonly boardRepository: Repository<BoardEntity>,
    @InjectRepository(ProjectsEntity)
    private readonly projectRepository: Repository<ProjectsEntity>,
  ) {}

  public async createSprint(
    body: CreateSprintDto,
    boardId: string,
  ): Promise<SprintEntity> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['project'],
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }

    const project = await this.projectRepository.findOne({
      where: { id: body.project_id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${body.project_id} not found`);
    }

    const newSprint = this.sprintRepository.create({
      name: body.name,
      goal: body.goal,
      status: body.status || SPRINT_STATUS.PLANNING,
      startDate: body.startDate,
      endDate: body.endDate,
      board,
      project,
    });

    return await this.sprintRepository.save(newSprint);
  }

  public async findAllSprints(): Promise<SprintEntity[]> {
    return await this.sprintRepository.find({
      relations: ['board', 'issues'],
    });
  }

  public async findSprintById(id: string): Promise<SprintEntity> {
    const sprint = await this.sprintRepository.findOne({
      where: { id },
      relations: ['board', 'issues', 'issues.assignee', 'issues.reporter'],
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    return sprint;
  }

  public async findSprintsByBoardId(boardId: string): Promise<SprintEntity[]> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }

    return await this.sprintRepository.find({
      where: { board: { id: boardId } },
      relations: ['issues'],
    });
  }

  public async findSprintsByProjectId(
    projectId: string,
  ): Promise<SprintEntity[]> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['boards'],
    });

    if (!project || !project.boards || project.boards.length === 0) {
      throw new NotFoundException(
        `Project with ID ${projectId} not found or has no boards`,
      );
    }

    // Get the first board for simplicity, in a real app we might want to handle multiple boards
    const boardId = project.boards[0].id;

    return await this.sprintRepository.find({
      where: { board: { id: boardId } },
      relations: ['issues'],
    });
  }

  public async updateSprint(
    id: string,
    body: UpdateSprintDto,
  ): Promise<SprintEntity> {
    const sprint = await this.findSprintById(id);

    // Update sprint with new values
    Object.assign(sprint, body);

    return await this.sprintRepository.save(sprint);
  }

  public async deleteSprint(id: string): Promise<void> {
    const sprint = await this.findSprintById(id);

    await this.sprintRepository.remove(sprint);
  }

  public async startSprint(id: string): Promise<SprintEntity> {
    const sprint = await this.findSprintById(id);

    // Only throw an error if the sprint is already completed
    if (sprint.status === SPRINT_STATUS.COMPLETED) {
      throw new Error('Completed sprints cannot be started again');
    }

    sprint.status = SPRINT_STATUS.ACTIVE;

    // Only set the start date if it's not already set
    if (!sprint.startDate) {
      sprint.startDate = new Date();
    }

    return await this.sprintRepository.save(sprint);
  }

  public async completeSprint(id: string): Promise<SprintEntity> {
    const sprint = await this.findSprintById(id);

    if (sprint.status !== SPRINT_STATUS.ACTIVE) {
      throw new Error('Only active sprints can be completed');
    }

    sprint.status = SPRINT_STATUS.COMPLETED;
    sprint.endDate = new Date();

    return await this.sprintRepository.save(sprint);
  }
}
