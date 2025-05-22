import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTracking } from './entities/time-tracking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeTracking])],
  exports: [TypeOrmModule],
})
export class TimeTrackingModule {} 