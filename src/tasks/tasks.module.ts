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
      CommentEntity,
      AttachmentEntity,
      BoardColumnEntity,
      SprintEntity,
    ]),
    forwardRef(() => ProjectsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationsModule),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath);
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname +
              '-' +
              uniqueSuffix +
              extname(file.originalname),
          );
        },
      }),
    }),
  ],
  controllers: [TasksController, CommentController, AttachmentController],
  providers: [TasksService, CommentService, AttachmentService],
  exports: [TasksService],
})
export class TasksModule {}
