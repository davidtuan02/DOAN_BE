import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { ProjectsEntity } from './projects.entity';
import { BoardColumnEntity } from './board-column.entity';
import { SprintEntity } from './sprint.entity';

@Entity({ name: 'boards' })
export class BoardEntity extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => ProjectsEntity, (project) => project.boards)
  @JoinColumn({ name: 'project_id' })
  project: ProjectsEntity;

  @OneToMany(() => BoardColumnEntity, (column) => column.board)
  columns: BoardColumnEntity[];

  @OneToMany(() => SprintEntity, (sprint) => sprint.board)
  sprints: SprintEntity[];
}
