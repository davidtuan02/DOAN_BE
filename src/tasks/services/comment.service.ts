import {
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { CreateCommentDTO, UpdateCommentDTO } from '../dto/comment.dto';
import { UsersService } from '../../users/services/users.service';
import { TasksService } from './tasks.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationType } from '../../notifications/entities/notification.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
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

    const savedComment = await this.commentRepository.save(newComment);

    // Send notification to assignee if exists and is not the commenter
    if (task.assignee && task.assignee.id !== userId) {
      try {
        // Get commenter details
        const commenter = await this.usersService.findUserById(userId);
        const commenterName = `${commenter.firstName} ${commenter.lastName}`;

        // Create notification
        await this.notificationService.createNotification(
          task.assignee,
          NotificationType.COMMENT_ADDED,
          'New comment on your task',
          `${commenterName} commented on task "${task.taskName}"`,
          `/projects/${task.project.id}/issues/${task.id}`,
          {
            taskId: task.id,
            commentId: savedComment.id,
            projectId: task.project?.id,
            commentedBy: userId,
          },
        );
      } catch (error) {
        console.error('Error sending comment notification:', error.message);
        // Don't fail the comment creation if notification fails
      }
    }

    return savedComment;
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
