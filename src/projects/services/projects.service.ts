import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersProjectsEntity } from '../../users/entities/usersProjects.entity';
import { UsersService } from '../../users/services/users.service';
import { DeleteResult, Repository, UpdateResult, Connection } from 'typeorm';
import { ProjectsEntity } from '../entities/projects.entity';
import { HttpCustomService } from '../../providers/http/http.service';
import { ProjectDTO, ProjectUpdateDTO } from '../dto/project.dto';
import { ACCESS_LEVEL } from '../../constants/access-level-enum';
import { ErrorManager } from '../../utils/error-manager.util';
import { TeamsEntity } from '../../teams/entities/teams.entity';
import { BoardEntity } from '../entities/board.entity';
import { BoardColumnEntity } from '../entities/board-column.entity';
import {
  AddProjectMemberDTO,
  AddMultipleProjectMembersDTO,
  ProjectMemberResponse,
  UpdateProjectMemberDTO,
} from '../dto/project-member.dto';
import { TaskStatus } from '../../tasks/entities/tasks.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectsEntity)
    private readonly projectRepository: Repository<ProjectsEntity>,
    @InjectRepository(UsersProjectsEntity)
    private readonly userProjectRepository: Repository<UsersProjectsEntity>,
    @InjectRepository(TeamsEntity)
    private readonly teamRepository: Repository<TeamsEntity>,
    private readonly usersService: UsersService,
    private readonly httpService: HttpCustomService,
    private readonly connection: Connection,
  ) {}

  public async createProject(body: ProjectDTO, userId: string): Promise<any> {
    try {
      const user = await this.usersService.findUserById(userId);

      // Extract teamId from body if it exists
      const { teamId, ...projectData } = body;

      // Save the project
      const project = await this.projectRepository.save(projectData);

      // Create the user-project relationship for the creator
      await this.userProjectRepository.save({
        accessLevel: ACCESS_LEVEL.OWNER,
        user: user,
        project,
      });

      // If teamId is provided, assign the project to the team
      if (teamId) {
        // Verify the team exists
        const team = await this.teamRepository.findOne({
          where: { id: teamId },
          relations: ['usersIncludes', 'usersIncludes.user'],
        });

        if (!team) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: `Team with ID ${teamId} not found`,
          });
        }

        // Update the project with the team
        project.team = team;
        await this.projectRepository.save(project);

        // Add all team members to the project
        if (team.usersIncludes && team.usersIncludes.length > 0) {
          for (const userTeam of team.usersIncludes) {
            // Skip if this is the creator (already added above)
            if (userTeam.user.id === userId) {
              continue;
            }

            // Determine access level based on team role
            let accessLevel = ACCESS_LEVEL.DEVELOPER; // Default for MEMBER

            switch (userTeam.role) {
              case 'admin':
                accessLevel = ACCESS_LEVEL.OWNER;
                break;
              case 'leader':
                accessLevel = ACCESS_LEVEL.MAINTAINER;
                break;
              case 'member':
                accessLevel = ACCESS_LEVEL.DEVELOPER;
                break;
            }

            // Add the team member to the project
            await this.userProjectRepository.save({
              accessLevel,
              user: userTeam.user,
              project,
            });
          }
        }
      }

      // Return the created project with user relationship
      return project;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async listApi() {
    return this.httpService.apiFindAll();
  }

  public async findProjects(): Promise<ProjectsEntity[]> {
    try {
      const projects: ProjectsEntity[] = await this.projectRepository.find();
      if (projects.length === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro resultado',
        });
      }
      return projects;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findProjectById(id: string): Promise<ProjectsEntity> {
    try {
      const project = await this.projectRepository
        .createQueryBuilder('project')
        .where({ id })
        .leftJoinAndSelect('project.usersIncludes', 'usersIncludes')
        .leftJoinAndSelect('usersIncludes.user', 'user')
        .leftJoinAndSelect('project.boards', 'boards')
        .getOne();
      if (!project) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No existe proyecto con el id ' + id,
        });
      }
      return project;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async updateProject(
    body: ProjectUpdateDTO,
    id: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const project: UpdateResult = await this.projectRepository.update(
        id,
        body,
      );
      if (project.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar proyecto',
        });
      }
      return project;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async deleteProject(id: string): Promise<DeleteResult | undefined> {
    try {
      // Start a transaction
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Find the project with all relations
        const project = await this.projectRepository.findOne({
          where: { id },
          relations: [
            'boards',
            'boards.columns',
            'boards.columns.tasks',
            'boards.sprints',
            'usersIncludes',
            'usersIncludes.user',
            'team'
          ]
        });

        if (!project) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Project not found',
          });
        }

        // Delete all attachments related to tasks in this project
        await queryRunner.manager.query(
          `DELETE FROM attachment WHERE task_id IN (SELECT id FROM task WHERE project_id = $1)`,
          [id]
        );

        // Delete all tasks directly from the task table
        await queryRunner.manager.query(
          `DELETE FROM task WHERE project_id = $1`,
          [id]
        );

        // Delete all sprints in the project's boards
        for (const board of project.boards) {
          if (board.sprints && board.sprints.length > 0) {
            await queryRunner.manager.remove(board.sprints);
          }
        }

        // Delete all board columns
        for (const board of project.boards) {
          if (board.columns && board.columns.length > 0) {
            await queryRunner.manager.remove(board.columns);
          }
        }

        // Delete all boards
        if (project.boards && project.boards.length > 0) {
          await queryRunner.manager.remove(project.boards);
        }

        // Delete all user-project relationships
        if (project.usersIncludes && project.usersIncludes.length > 0) {
          await queryRunner.manager.remove(project.usersIncludes);
        }

        // Remove team relationship
        if (project.team) {
          project.team = null;
          await queryRunner.manager.save(project);
        }

        // Finally delete the project
        const result = await queryRunner.manager.delete(ProjectsEntity, id);

        // Commit the transaction
        await queryRunner.commitTransaction();

        if (result.affected === 0) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Could not delete project',
          });
        }

        return result;
      } catch (error) {
        // Rollback the transaction in case of error
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release the query runner
        await queryRunner.release();
      }
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async assignProjectToTeam(
    projectId: string,
    teamId: string,
  ): Promise<ProjectsEntity> {
    try {
      // Find the project
      const project = await this.findProjectById(projectId);
      if (!project) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: `Project with ID ${projectId} not found`,
        });
      }

      // Verify the team exists
      const team = await this.teamRepository.findOne({
        where: { id: teamId },
      });

      if (!team) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: `Team with ID ${teamId} not found`,
        });
      }

      // Update the project with the team
      project.team = team;
      return await this.projectRepository.save(project);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findProjectsByUserId(userId: string): Promise<ProjectsEntity[]> {
    try {
      await this.usersService.findUserById(userId);

      const userProjects = await this.userProjectRepository.find({
        where: { user: { id: userId } },
        relations: [
          'project',
          'project.usersIncludes',
          'project.usersIncludes.user',
          'project.tasks',
        ],
      });

      if (userProjects.length === 0) {
        return [];
      }

      const projects = userProjects.map((userProject) => {
        const project = userProject.project;
        const tasks = project.tasks || [];
        
        // Log để kiểm tra
        console.log('Project:', project.name);
        console.log('All tasks:', tasks.map(t => ({
          id: t.id,
          name: t.taskName,
          status: t.status
        })));
        
        const openTasks = tasks.filter(task => task.status !== TaskStatus.DONE);
        const doneTasks = tasks.filter(task => task.status === TaskStatus.DONE);

        // Log kết quả filter
        console.log('Open tasks:', openTasks.map(t => ({
          id: t.id,
          name: t.taskName,
          status: t.status
        })));
        console.log('Done tasks:', doneTasks.map(t => ({
          id: t.id,
          name: t.taskName,
          status: t.status
        })));

        return {
          ...project,
          issueCount: {
            open: openTasks.length,
            done: doneTasks.length
          }
        };
      });

      return projects;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async createDefaultBoardForProject(
    projectId: string,
  ): Promise<BoardEntity> {
    try {
      // Find the project
      const project = await this.findProjectById(projectId);

      // Check if the project already has boards
      const projectWithBoards = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['boards'],
      });

      if (
        projectWithBoards &&
        projectWithBoards.boards &&
        projectWithBoards.boards.length > 0
      ) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: `Project already has ${projectWithBoards.boards.length} board(s)`,
        });
      }

      // Create a new board
      const boardRepository = this.connection.getRepository(BoardEntity);
      const newBoard = boardRepository.create({
        name: 'Default Board',
        project: project,
      });

      // Save the board
      const savedBoard = await boardRepository.save(newBoard);

      // Create default columns for the board if needed
      await this.createDefaultBoardColumns(savedBoard);

      return savedBoard;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  private async createDefaultBoardColumns(board: BoardEntity): Promise<void> {
    try {
      const columnRepository = this.connection.getRepository(BoardColumnEntity);

      // Define default columns
      const defaultColumns = [
        { name: 'To Do', order: 1 },
        { name: 'In Progress', order: 2 },
        { name: 'Review', order: 3 },
        { name: 'Done', order: 4 },
      ];

      // Create and save columns
      for (const column of defaultColumns) {
        const newColumn = columnRepository.create({
          name: column.name,
          order: column.order,
          board: board,
        });
        await columnRepository.save(newColumn);
      }
    } catch (error) {
      console.error('Error creating default board columns:', error);
      // Don't throw here to avoid failing the board creation
    }
  }

  public async getProjectMembers(
    projectId: string,
  ): Promise<ProjectMemberResponse[]> {
    try {
      const project = await this.findProjectById(projectId);

      if (!project.usersIncludes || project.usersIncludes.length === 0) {
        return [];
      }

      return project.usersIncludes.map((userProject) => ({
        id: userProject.id,
        userId: userProject.user.id,
        userName: `${userProject.user.firstName || ''}`,
        userEmail: userProject.user.email,
        accessLevel: userProject.accessLevel,
        role: userProject.user.role,
        createdAt: userProject.createdAt,
        updatedAt: userProject.updatedAt,
      }));
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async addMemberToProject(
    projectId: string,
    addMemberDto: AddProjectMemberDTO,
  ): Promise<ProjectMemberResponse> {
    try {
      const project = await this.findProjectById(projectId);
      const user = await this.usersService.findUserById(addMemberDto.userId);

      // Check if user is already a member of the project
      const existingRelation = await this.userProjectRepository.findOne({
        where: {
          project: { id: projectId },
          user: { id: addMemberDto.userId },
        },
        relations: ['user', 'project'],
      });

      if (existingRelation) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'User is already a member of this project',
        });
      }

      // Create the user-project relationship
      const newMember = await this.userProjectRepository.save({
        accessLevel: addMemberDto.accessLevel,
        user: user,
        project: project,
      });

      // Refresh to get full relations
      const savedMember = await this.userProjectRepository.findOne({
        where: { id: newMember.id },
        relations: ['user', 'project'],
      });

      return {
        id: savedMember.id,
        userId: savedMember.user.id,
        userName: `${savedMember.user.firstName} ${savedMember.user.lastName || ''}`,
        userEmail: savedMember.user.email,
        accessLevel: savedMember.accessLevel,
        role: savedMember.user.role,
        createdAt: savedMember.createdAt,
        updatedAt: savedMember.updatedAt,
      };
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async addMultipleMembersToProject(
    projectId: string,
    addMembersDto: AddMultipleProjectMembersDTO,
  ): Promise<ProjectMemberResponse[]> {
    try {
      const results: ProjectMemberResponse[] = [];

      for (const memberDto of addMembersDto.members) {
        try {
          const result = await this.addMemberToProject(projectId, memberDto);
          results.push(result);
        } catch (error) {
          // Log the error but continue with other members
          console.error(
            `Failed to add member ${memberDto.userId}: ${error.message}`,
          );
        }
      }

      return results;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async updateProjectMember(
    projectId: string,
    userId: string,
    updateDto: UpdateProjectMemberDTO,
  ): Promise<ProjectMemberResponse> {
    try {
      // Find the user-project relation
      const relation = await this.userProjectRepository.findOne({
        where: {
          project: { id: projectId },
          user: { id: userId },
        },
        relations: ['user', 'project'],
      });

      if (!relation) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'User is not a member of this project',
        });
      }

      // Update the access level
      relation.accessLevel = updateDto.accessLevel;
      await this.userProjectRepository.save(relation);

      // Refresh to get updated data
      const updatedRelation = await this.userProjectRepository.findOne({
        where: { id: relation.id },
        relations: ['user', 'project'],
      });

      return {
        id: updatedRelation.id,
        userId: updatedRelation.user.id,
        userName: `${updatedRelation.user.firstName} ${updatedRelation.user.lastName || ''}`,
        userEmail: updatedRelation.user.email,
        accessLevel: updatedRelation.accessLevel,
        role: updatedRelation.user.role,
        createdAt: updatedRelation.createdAt,
        updatedAt: updatedRelation.updatedAt,
      };
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async removeProjectMember(
    projectId: string,
    userId: string,
  ): Promise<void> {
    try {
      // Find the user-project relation
      const relation = await this.userProjectRepository.findOne({
        where: {
          project: { id: projectId },
          user: { id: userId },
        },
      });

      if (!relation) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'User is not a member of this project',
        });
      }

      // Check if the user is the owner and it's the last owner
      if (relation.accessLevel === ACCESS_LEVEL.OWNER) {
        const ownersCount = await this.userProjectRepository.count({
          where: {
            project: { id: projectId },
            accessLevel: ACCESS_LEVEL.OWNER,
          },
        });

        if (ownersCount <= 1) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Cannot remove the last owner of the project',
          });
        }
      }

      // Remove the relation
      await this.userProjectRepository.remove(relation);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }
}
