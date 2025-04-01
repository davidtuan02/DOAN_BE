import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PUBLIC_KEY } from '../../constants/key-decorator';
import { UsersService } from '../../users/services/users.service';
import { UseToken } from '../../utils/use-token.util';
import { IUseToken } from '../interfaces/auth.interface';
import { IRequestWithUser } from '../../interfaces/request-with-user.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userService: UsersService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const req = context
      .switchToHttp()
      .getRequest<Request & { idUser: string; roleUser: string; user: any }>();

    // Log request path - helps with debugging
    const path = req.url;

    const token = req.headers['tasks_token'];

    if (!token || Array.isArray(token)) {
      throw new UnauthorizedException('Invalid token');
    }

    const manageToken: IUseToken | string = UseToken(token);

    if (typeof manageToken === 'string') {
      throw new UnauthorizedException(manageToken);
    }

    if (manageToken.isExpired) {
      throw new UnauthorizedException('Token expired');
    }

    const { sub } = manageToken;

    const user = await this.userService.findUserById(sub);
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    req.idUser = user.id;
    req.roleUser = user.role;
    req.user = {
      id: user.id, // Add explicit id field for full clarity
      sub: user.id,
      role: user.role,
    };
    return true;
  }
}
