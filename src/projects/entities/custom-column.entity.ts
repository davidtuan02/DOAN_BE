import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { ProjectsEntity } from './projects.entity';
import { COLUMN_TYPE } from '../../constants/column-type.enum';

@Entity({ name: 'custom_columns' })
export class CustomColumnEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: COLUMN_TYPE })
  type: COLUMN_TYPE;

  @Column({ type: 'json', nullable: true })
  options: string[];

  @Column({ default: false })
  required: boolean;

  @ManyToOne(() => ProjectsEntity, (project) => project.customColumns)
  @JoinColumn({ name: 'project_id' })
  project: ProjectsEntity;
}
