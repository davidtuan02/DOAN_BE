import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { ProjectsEntity } from './projects.entity';
import { FilterCriteriaEntity } from './filter-criteria.entity';

@Entity({ name: 'custom_filters' })
export class CustomFilterEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  isStarred: boolean;

  @Column()
  createdBy: string;

  @ManyToOne(() => ProjectsEntity, (project) => project.customFilters)
  @JoinColumn({ name: 'project_id' })
  project: ProjectsEntity;

  @OneToMany(() => FilterCriteriaEntity, (criteria) => criteria.filter)
  criteria: FilterCriteriaEntity[];
}
