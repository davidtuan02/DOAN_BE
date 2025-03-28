import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { CustomFilterEntity } from './custom-filter.entity';
import { FILTER_OPERATOR } from '../../constants/filter-operator.enum';

@Entity({ name: 'filter_criteria' })
export class FilterCriteriaEntity extends BaseEntity {
  @Column()
  field: string;

  @Column({ type: 'enum', enum: FILTER_OPERATOR })
  operator: FILTER_OPERATOR;

  @Column({ type: 'json' })
  value: any;

  @ManyToOne(() => CustomFilterEntity, (filter) => filter.criteria)
  @JoinColumn({ name: 'filter_id' })
  filter: CustomFilterEntity;
}
