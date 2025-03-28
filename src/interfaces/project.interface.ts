import { PROJECT_TYPE } from '../constants/project-type.enum';
import { TeamsEntity } from '../teams/entities/teams.entity';

export interface IProject {
  name: string;
  description: string;
  key: string;
  projectType: PROJECT_TYPE;
  team?: TeamsEntity;
}
