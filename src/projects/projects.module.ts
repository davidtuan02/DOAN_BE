import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsEntity } from './entities/projects.entity';
import { ProjectsService } from './services/projects.service';
import { ProjectsController } from './controllers/projects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectsEntity])],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
