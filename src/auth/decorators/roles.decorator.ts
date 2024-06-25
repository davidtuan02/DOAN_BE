import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../../constants/key-decorator';
import { ROLES } from '../../constants/roles-enum';

export const Roles = (...roles: Array<keyof typeof ROLES>) =>
  SetMetadata(ROLES_KEY, roles);
