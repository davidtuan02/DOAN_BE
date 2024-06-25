import { SetMetadata } from '@nestjs/common';
import { ACCESS_LEVEL } from '../../constants/access-level-enum';
import { ACCESS_LEVEL_KEY } from '../../constants/key-decorator';

export const AccessLevel = (level: keyof typeof ACCESS_LEVEL) =>
  SetMetadata(ACCESS_LEVEL_KEY, level);
