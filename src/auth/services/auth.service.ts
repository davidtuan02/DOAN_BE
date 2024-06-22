import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UsersEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/services/users.service';
import { IPayloadToken } from '../interfaces/payload.interface';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  public async validateUser(
    username: string,
    password: string,
  ): Promise<UsersEntity | null> {
    const userByUsername = await this.userService.findBy({
      key: 'username',
      value: username,
    });
    const userByEmail = await this.userService.findBy({
      key: 'email',
      value: username,
    });

    if (userByUsername) {
      if (await bcrypt.compare(password, userByUsername.password))
        return userByUsername;
    }
    if (userByEmail) {
      if (await bcrypt.compare(password, userByEmail.password))
        return userByEmail;
    }
    return null;
  }

  public async signJWT({
    payload,
    secret,
    expired,
  }: {
    payload: jwt.JwtPayload | Buffer | string;
    secret: jwt.Secret;
    expired: string | number;
  }): Promise<string> {
    return jwt.sign(payload, secret, { expiresIn: expired });
  }

  public async generateJWT(user: UsersEntity): Promise<any> {
    const getUser: UsersEntity = await this.userService.findById(user.id);
    const payload: IPayloadToken = {
      role: getUser.role,
      sub: getUser.id,
    };

    return {
      accessToken: await this.signJWT({
        payload,
        secret: process.env.JWT_SECRET,
        expired: '1h',
      }),
      user,
    };
  }
}
