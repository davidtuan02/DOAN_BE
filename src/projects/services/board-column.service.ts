import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { BoardColumnEntity } from '../entities/board-column.entity';
import { BoardEntity } from '../entities/board.entity';
import { ProjectsEntity } from '../entities/projects.entity';
import {
  CreateBoardColumnDTO,
  UpdateBoardColumnDTO,
  ReorderBoardColumnsDTO,
} from '../dto/board-column.dto';

@Injectable()
export class BoardColumnService {
  constructor(
    @InjectRepository(BoardColumnEntity)
    private readonly boardColumnRepository: Repository<BoardColumnEntity>,
    @InjectRepository(BoardEntity)
    private readonly boardRepository: Repository<BoardEntity>,
    @InjectRepository(ProjectsEntity)
    private readonly projectRepository: Repository<ProjectsEntity>,
  ) {}

  async findColumnsByBoardId(boardId: string): Promise<BoardColumnEntity[]> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }

    return this.boardColumnRepository.find({
      where: { board: { id: boardId } },
      order: { order: 'ASC' },
    });
  }

  async findColumnsByProjectId(
    projectId: string,
  ): Promise<BoardColumnEntity[]> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['boards'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (!project.boards || project.boards.length === 0) {
      // Nếu project không có board, tạo một board mới
      const newBoard = this.boardRepository.create();
      newBoard.project = project;
      const savedBoard = await this.boardRepository.save(newBoard);

      // Trả về mảng rỗng vì board mới chưa có columns
      return [];
    }

    // Lấy board đầu tiên của project
    const board = project.boards[0];

    return this.boardColumnRepository.find({
      where: { board: { id: board.id } },
      order: { order: 'ASC' },
    });
  }

  async createColumn(
    createColumnDto: CreateBoardColumnDTO,
  ): Promise<BoardColumnEntity> {
    const { boardId, projectId, ...columnData } = createColumnDto;

    if (!boardId && !projectId) {
      throw new BadRequestException(
        'Either boardId or projectId must be provided',
      );
    }

    let board: BoardEntity;

    if (boardId) {
      // Tìm board theo boardId
      board = await this.boardRepository.findOne({
        where: { id: boardId },
      });

      if (!board) {
        throw new NotFoundException(`Board with ID ${boardId} not found`);
      }
    } else {
      // Tìm project và lấy board đầu tiên, hoặc tạo board mới
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['boards'],
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      if (!project.boards || project.boards.length === 0) {
        // Tạo board mới cho project
        board = this.boardRepository.create();
        board.project = project;
        board = await this.boardRepository.save(board);
      } else {
        // Lấy board đầu tiên của project
        board = project.boards[0];
      }
    }

    // Check for default columns if this is marked as default
    if (columnData.isDefault) {
      const existingDefault = await this.boardColumnRepository.findOne({
        where: { board: { id: board.id }, isDefault: true },
      });

      if (existingDefault) {
        throw new BadRequestException(
          'A default column already exists for this board',
        );
      }
    }

    // Get the highest order to place the new column at the end
    const highestOrderColumn = await this.boardColumnRepository.findOne({
      where: { board: { id: board.id } },
      order: { order: 'DESC' },
    });

    const newOrder = highestOrderColumn ? highestOrderColumn.order + 1 : 0;

    const newColumn = this.boardColumnRepository.create({
      ...columnData,
      order: columnData.order ?? newOrder,
      board,
    });

    return this.boardColumnRepository.save(newColumn);
  }

  async updateColumn(
    id: string,
    updateColumnDto: UpdateBoardColumnDTO,
  ): Promise<BoardColumnEntity> {
    const column = await this.boardColumnRepository.findOne({
      where: { id },
      relations: ['board'],
    });

    if (!column) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    // Check for default columns if attempting to change default status
    if (updateColumnDto.isDefault !== undefined && updateColumnDto.isDefault) {
      const existingDefault = await this.boardColumnRepository.findOne({
        where: {
          board: { id: column.board.id },
          isDefault: true,
          id: Not(id), // Not the current column
        },
      });

      if (existingDefault) {
        // Remove default status from other column
        await this.boardColumnRepository.update(existingDefault.id, {
          isDefault: false,
        });
      }
    }

    Object.assign(column, updateColumnDto);
    return this.boardColumnRepository.save(column);
  }

  async deleteColumn(id: string): Promise<void> {
    const column = await this.boardColumnRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });

    if (!column) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    // Check if the column has tasks
    if (column.tasks && column.tasks.length > 0) {
      throw new BadRequestException(
        'Cannot delete column with tasks. Move the tasks first.',
      );
    }

    // Check if it's the default column
    if (column.isDefault) {
      throw new BadRequestException(
        'Cannot delete the default column. Set another column as default first.',
      );
    }

    await this.boardColumnRepository.remove(column);
  }

  async reorderColumns(
    reorderDto: ReorderBoardColumnsDTO,
  ): Promise<BoardColumnEntity[]> {
    const { boardId, projectId, columnOrders } = reorderDto;

    console.log('Reorder request received:', {
      boardId,
      projectId,
      columnOrders,
    });

    if (!boardId && !projectId) {
      throw new BadRequestException(
        'Either boardId or projectId must be provided',
      );
    }

    let boardToUpdate: string;

    if (boardId) {
      // Verify board exists
      const board = await this.boardRepository.findOne({
        where: { id: boardId },
      });

      if (!board) {
        throw new NotFoundException(`Board with ID ${boardId} not found`);
      }

      boardToUpdate = boardId;
    } else {
      // Find board by project
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['boards'],
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      if (!project.boards || project.boards.length === 0) {
        throw new BadRequestException('Project has no boards');
      }

      boardToUpdate = project.boards[0].id;
    }

    console.log('Board to update:', boardToUpdate);
    console.log('Column orders:', columnOrders);

    // Xử lý từng column theo thứ tự
    try {
      for (const item of columnOrders) {
        console.log(`Updating column ${item.id} to order ${item.order}`);
        await this.boardColumnRepository.update(item.id, { order: item.order });
      }

      // Lấy lại columns đã cập nhật và trả về
      const updatedColumns = await this.boardColumnRepository.find({
        where: { board: { id: boardToUpdate } },
        order: { order: 'ASC' },
      });

      console.log('Updated columns:', updatedColumns);
      return updatedColumns;
    } catch (error) {
      console.error('Error updating column orders:', error);
      throw error;
    }
  }
}
