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
                accessLevel = ACCESS_LEVEL.MANTEINER;
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
      const project: DeleteResult = await this.projectRepository.delete(id);
      if (project.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar proyecto',
        });
      }
      return project;
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
      // Vérifier si l'utilisateur existe
      await this.usersService.findUserById(userId);

      // Rechercher tous les projets associés à cet utilisateur via la relation usersProjects
      const userProjects = await this.userProjectRepository.find({
        where: { user: { id: userId } },
        relations: [
          'project',
          'project.usersIncludes',
          'project.usersIncludes.user',
        ],
      });

      if (userProjects.length === 0) {
        return []; // Retourner un tableau vide si aucun projet trouvé
      }

      // Extraire les projets de la relation
      const projects = userProjects.map((userProject) => userProject.project);

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
}
