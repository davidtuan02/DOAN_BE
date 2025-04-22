import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalEntity } from './entities/goal.entity';
import { GoalsService } from './services/goals.service';
import { GoalsController } from './controllers/goals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GoalEntity])],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
