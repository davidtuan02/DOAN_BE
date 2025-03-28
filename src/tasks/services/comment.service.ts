import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { CreateCommentDTO, UpdateCommentDTO } from '../dto/comment.dto';
import { UsersService } from '../../users/services/users.service';
import { TasksService } from './tasks.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
  ) {}

  public async create(
    userId: string,
    commentDto: CreateCommentDTO,
  ): Promise<CommentEntity> {
    // Verify task exists
    const task = await this.tasksService.findTaskById(commentDto.taskId);
    if (!task) {
      throw new NotFoundException(
        `Task with ID ${commentDto.taskId} not found`,
      );
    }

    // Create new comment
    const newComment = this.commentRepository.create({
      content: commentDto.content,
      taskId: commentDto.taskId,
      userId: userId,
    });

    return this.commentRepository.save(newComment);
  }

  public async findAllByTaskId(taskId: string): Promise<CommentEntity[]> {
    return this.commentRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  public async findById(id: string): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  public async update(
    id: string,
    userId: string,
    updateCommentDto: UpdateCommentDTO,
  ): Promise<CommentEntity> {
    // Find comment by ID
    const comment = await this.findById(id);

    // Verify the user owns the comment
    if (comment.userId !== userId) {
      throw new NotFoundException(
        `You don't have permission to update this comment`,
      );
    }

    // Update and save
    comment.content = updateCommentDto.content;
    comment.updatedAt = new Date();

    return this.commentRepository.save(comment);
  }

  public async remove(id: string, userId: string): Promise<void> {
    // Find comment by ID
    const comment = await this.findById(id);

    // Verify the user owns the comment
    if (comment.userId !== userId) {
      throw new NotFoundException(
        `You don't have permission to delete this comment`,
      );
    }

    await this.commentRepository.remove(comment);
  }
}
