import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectsService } from '../../projects/services/projects.service';
import { ErrorManager } from '../../utils/error-manager.util';
import { DeleteResult, Repository, UpdateResult, Not } from 'typeorm';
import { TasksDTO, UpdateTaskDTO } from '../dto/tasks.dto';
import { TasksEntity } from '../entities/tasks.entity';
import { UsersService } from '../../users/services/users.service';
import { BoardColumnEntity } from '../../projects/entities/board-column.entity';
import { SprintEntity } from '../../projects/entities/sprint.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksEntity)
    private readonly taskRepository: Repository<TasksEntity>,
    @InjectRepository(BoardColumnEntity)
    private readonly boardColumnRepository: Repository<BoardColumnEntity>,
    @InjectRepository(SprintEntity)
    private readonly sprintRepository: Repository<SprintEntity>,
    private readonly projectService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  public async createTask(
    body: TasksDTO,
    projectId: string,
  ): Promise<TasksEntity> {
    try {
      const project = await this.projectService.findProjectById(projectId);
      if (project === undefined) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'No se ha encontrado el proyecto',
        });
      }
      return await this.taskRepository.save({
        ...body,
        project,
      });
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findAllTasks(): Promise<TasksEntity[]> {
    try {
      const tasks = await this.taskRepository.find({
        relations: ['project', 'boardColumn', 'assignee'],
      });
      if (tasks.length === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontraron tareas',
        });
      }
      return tasks;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findTaskById(id: string): Promise<TasksEntity> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id },
        relations: ['project', 'boardColumn', 'assignee'],
      });
      if (!task) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `La tarea con ID ${id} no existe`,
        });
      }
      return task;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findTasksByProject(projectId: string): Promise<TasksEntity[]> {
    try {
      const project = await this.projectService.findProjectById(projectId);
      const tasks = await this.taskRepository.find({
        where: { project: { id: projectId } },
        relations: ['boardColumn', 'assignee'],
      });
      return tasks;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async updateTask(
    id: string,
    body: UpdateTaskDTO,
  ): Promise<TasksEntity> {
    try {
      const task = await this.findTaskById(id);

      // Tạo đối tượng cập nhật bằng cách merge các thuộc tính
      const updatedTask = await this.taskRepository.save({
        ...task,
        ...body,
      });

      // Tải lại task với đầy đủ relation để trả về
      const refreshedTask = await this.findTaskById(id);

      return refreshedTask;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async deleteTask(id: string): Promise<DeleteResult> {
    try {
      const task = await this.findTaskById(id);
      const deletedTask = await this.taskRepository.delete(id);
      if (deletedTask.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar la tarea',
        });
      }
      return deletedTask;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async assignTaskToUser(
    taskId: string,
    userId: string,
  ): Promise<TasksEntity> {
    try {
      const task = await this.findTaskById(taskId);
      const user = await this.usersService.findUserById(userId);

      task.assignee = user;
      return await this.taskRepository.save(task);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async moveTaskToColumn(
    taskId: string,
    columnId: string,
  ): Promise<TasksEntity> {
    try {
      const task = await this.findTaskById(taskId);
      const column = await this.boardColumnRepository.findOne({
        where: { id: columnId },
      });

      if (!column) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `La columna con ID ${columnId} no existe`,
        });
      }

      task.boardColumn = column;
      return await this.taskRepository.save(task);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async addTaskToSprint(
    taskId: string,
    sprintId: string | null,
  ): Promise<TasksEntity> {
    try {
      const task = await this.findTaskById(taskId);

      // Nếu sprintId là null thì xóa task khỏi tất cả sprint
      if (sprintId === null) {
        // Tìm tất cả sprint chứa task này
        const allSprints = await this.sprintRepository.find({
          relations: ['issues'],
        });

        // Lọc ra các sprint chứa task này
        const sprintsWithTask = allSprints.filter(
          (sprint) =>
            sprint.issues && sprint.issues.some((issue) => issue.id === taskId),
        );

        // Xóa task khỏi các sprint này
        for (const sprint of sprintsWithTask) {
          sprint.issues = sprint.issues.filter((issue) => issue.id !== taskId);
          await this.sprintRepository.save(sprint);
        }

        return task;
      }

      // Thêm task vào sprint chỉ định
      const sprint = await this.sprintRepository.findOne({
        where: { id: sprintId },
        relations: ['issues'],
      });

      if (!sprint) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `El sprint con ID ${sprintId} no existe`,
        });
      }

      // Khởi tạo mảng issues nếu chưa có
      if (!sprint.issues) {
        sprint.issues = [];
      }

      // Xóa task khỏi các sprint khác nếu có
      const otherSprints = await this.sprintRepository.find({
        where: { id: Not(sprintId) },
        relations: ['issues'],
      });

      for (const otherSprint of otherSprints) {
        if (
          otherSprint.issues &&
          otherSprint.issues.some((issue) => issue.id === taskId)
        ) {
          otherSprint.issues = otherSprint.issues.filter(
            (issue) => issue.id !== taskId,
          );
          await this.sprintRepository.save(otherSprint);
        }
      }

      // Thêm task vào sprint mới nếu chưa có
      const taskExists = sprint.issues.some((issue) => issue.id === task.id);
      if (!taskExists) {
        sprint.issues.push(task);
        await this.sprintRepository.save(sprint);
      }

      return task;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }
}
