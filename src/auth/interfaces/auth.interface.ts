import { ROLES } from '../../constants/roles-enum';
import { UsersEntity } from '../../users/entities/user.entity';

export interface PayloadToken {
  sub: string;
  role: ROLES;
}

export interface AuthBody {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UsersEntity;
}

export interface AuthTokenResult {
  role: string;
  sub: string;
  iat: number;
  exp: number;
}

export interface IUseToken {
  role: string;
  sub: string;
  isExpired: boolean;
}
