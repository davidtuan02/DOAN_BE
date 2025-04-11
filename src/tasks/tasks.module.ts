import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module';
import { TasksController } from './controllers/tasks.controller';
import { CommentController } from './controllers/comment.controller';
import { TasksEntity } from './entities/tasks.entity';
import { CommentEntity } from './entities/comment.entity';
import { TasksService } from './services/tasks.service';
import { CommentService } from './services/comment.service';
import { BoardColumnEntity } from '../projects/entities/board-column.entity';
import { SprintEntity } from '../projects/entities/sprint.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TasksEntity,
      BoardColumnEntity,
      SprintEntity,
      CommentEntity,
    ]),
    forwardRef(() => ProjectsModule),
    UsersModule,
  ],
  providers: [TasksService, CommentService],
  controllers: [TasksController, CommentController],
  exports: [TasksService, TypeOrmModule],
})
export class TasksModule {}
