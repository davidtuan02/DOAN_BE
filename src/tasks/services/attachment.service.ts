import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttachmentEntity } from '../entities/attachment.entity';
import { TasksService } from './tasks.service';
import * as fs from 'fs';
import * as path from 'path';
import { AttachmentResponseDTO } from '../dto/attachment.dto';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepository: Repository<AttachmentEntity>,
    private readonly tasksService: TasksService,
  ) {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  async uploadAttachment(
    file: Express.Multer.File,
    taskId: string,
  ): Promise<AttachmentResponseDTO> {
    const task = await this.tasksService.findTaskById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // File is already saved by Multer, just create the attachment entity
    const attachment = this.attachmentRepository.create({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      path: file.path,
      size: file.size,
      task,
    });

    const savedAttachment = await this.attachmentRepository.save(attachment);

    return {
      id: savedAttachment.id,
      filename: savedAttachment.filename,
      originalname: savedAttachment.originalname,
      mimetype: savedAttachment.mimetype,
      path: savedAttachment.path,
      size: savedAttachment.size,
      createdAt: savedAttachment.createdAt,
      updatedAt: savedAttachment.updatedAt,
    };
  }

  async getAttachmentsByTaskId(
    taskId: string,
  ): Promise<AttachmentResponseDTO[]> {
    const task = await this.tasksService.findTaskById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const attachments = await this.attachmentRepository.find({
      where: { task: { id: taskId } },
    });

    return attachments.map((attachment) => ({
      id: attachment.id,
      filename: attachment.filename,
      originalname: attachment.originalname,
      mimetype: attachment.mimetype,
      path: attachment.path,
      size: attachment.size,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
    }));
  }

  async getAttachmentById(id: string): Promise<AttachmentEntity> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
      relations: ['task'],
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  async deleteAttachment(id: string): Promise<void> {
    const attachment = await this.getAttachmentById(id);

    // Delete file from filesystem
    try {
      fs.unlinkSync(attachment.path);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await this.attachmentRepository.remove(attachment);
  }
}
