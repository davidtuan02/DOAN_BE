import { EntityRepository, Repository } from 'typeorm';
import { Sprint } from './sprint.entity';

@EntityRepository(Sprint)
export class SprintRepository extends Repository<Sprint> {} 