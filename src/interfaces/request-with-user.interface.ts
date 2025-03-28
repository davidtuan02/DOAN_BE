import { Request } from 'express';
import { UsersEntity } from '../users/entities/user.entity';

export interface RequestWithUser extends Request {
  user: UsersEntity;
}

export interface IRequestWithUser extends Request {
  user: {
    sub: string;
    role: string;
    [key: string]: any;
  };
}
