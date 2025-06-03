import { SetMetadata } from '@nestjs/common';
import { ADMIN_KEY } from '../../constants/key-decorator';
import { ROLES } from '../../constants/roles-enum';

export const AdminAccess = () => SetMetadata(ADMIN_KEY, ROLES.MANAGER);
