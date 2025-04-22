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

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => BoardEntity, (board) => board.columns)
  @JoinColumn({ name: 'board_id' })
  board: BoardEntity;

  @OneToMany(() => TasksEntity, (task) => task.boardColumn)
  tasks: TasksEntity[];
}
