import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { BoardEntity } from './board.entity';
import { TasksEntity } from '../../tasks/entities/tasks.entity';

@Entity({ name: 'board_columns' })
export class BoardColumnEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  order: number;

  @ManyToOne(() => BoardEntity, (board) => board.columns)
  @JoinColumn({ name: 'board_id' })
  board: BoardEntity;

  @OneToMany(() => TasksEntity, (task) => task.boardColumn)
  tasks: TasksEntity[];
}
