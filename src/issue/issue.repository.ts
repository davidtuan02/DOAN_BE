import { EntityRepository, Repository } from 'typeorm';
import { Issue } from './issue.entity';

@EntityRepository(Issue)
export class IssueRepository extends Repository<Issue> {} 