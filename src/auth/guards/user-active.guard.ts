import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class UserActiveGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const { idUser } = req;

    if (!idUser) {
      throw new UnauthorizedException('User is not authenticated');
    }

    // Here you could add additional checks for user active status
    // For example, checking if the user is not disabled or banned

    return true;
  }
}
