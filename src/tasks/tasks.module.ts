import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module';
import { TasksController } from './controllers/tasks.controller';
import { CommentController } from './controllers/comment.controller';
import { AttachmentController } from './controllers/attachment.controller';
import { TasksEntity } from './entities/tasks.entity';
import { CommentEntity } from './entities/comment.entity';
import { AttachmentEntity } from './entities/attachment.entity';
import { TasksService } from './services/tasks.service';
import { CommentService } from './services/comment.service';
import { AttachmentService } from './services/attachment.service';
import { BoardColumnEntity } from '../projects/entities/board-column.entity';
import { SprintEntity } from '../projects/entities/sprint.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TasksEntity,
      BoardColumnEntity,
      SprintEntity,
      CommentEntity,
      AttachmentEntity,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads';
          // Create directory if it doesn't exist
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Create unique filename
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Optional file filter to restrict file types if needed
        // For now, accepting all file types
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }),
    forwardRef(() => ProjectsModule),
    UsersModule,
    forwardRef(() => NotificationsModule),
  ],
  providers: [TasksService, CommentService, AttachmentService],
  controllers: [TasksController, CommentController, AttachmentController],
  exports: [TasksService, TypeOrmModule],
})
export class TasksModule {}
