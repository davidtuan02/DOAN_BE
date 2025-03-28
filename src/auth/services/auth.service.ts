import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UsersEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users.service';
import { AuthResponse, PayloadToken } from '../interfaces/auth.interface';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import * as crypto from 'crypto';

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
    const userByEmial = await this.userService.findBy({
      key: 'email',
      value: username,
    });

    if (userByUsername) {
      const match = await bcrypt.compare(password, userByUsername.password);
      if (match) return userByUsername;
    }

    if (userByEmial) {
      const match = await bcrypt.compare(password, userByEmial.password);
      if (match) return userByEmial;
    }

    return null;
  }

  public signJWT({
    payload,
    secret,
    expires,
  }: {
    payload: jwt.JwtPayload;
    secret: string;
    expires: number | string;
  }): string {
    return jwt.sign(payload, secret, { expiresIn: expires });
  }

  public async generateJWT(user: UsersEntity): Promise<AuthResponse> {
    const getUser = await this.userService.findUserById(user.id);

    const payload: PayloadToken = {
      role: getUser.role,
      sub: getUser.id,
    };

    return {
      accessToken: this.signJWT({
        payload,
        secret: process.env.JWT_SECRET,
        expires: '1h',
      }),
      user,
    };
  }

  public async forgotPassword(
    forgotPasswordDto: ForgotPasswordDTO,
  ): Promise<{ message: string }> {
    const user = await this.userService.findBy({
      key: 'email',
      value: forgotPasswordDto.email,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await this.userService.updateUser(
      {
        resetToken,
        resetTokenExpiry,
      },
      user.id,
    );

    // TODO: Send email with reset token
    // For now, we'll just return a success message
    // In a real application, you would send an email with the reset token
    // and instructions on how to reset the password

    return {
      message: 'Password reset instructions have been sent to your email.',
    };
  }

  public async getProfile(userId: string): Promise<UsersEntity> {
    return this.userService.findUserById(userId);
  }

  public async updateProfile(
    userId: string,
    userData: any,
  ): Promise<UsersEntity> {
    await this.userService.updateUser(userData, userId);
    return this.userService.findUserById(userId);
  }

  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userService.findUserById(userId);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(
      newPassword,
      +process.env.HASH_SALT,
    );
    await this.userService.updateUser({ password: hashedPassword }, userId);

    return { message: 'Password changed successfully' };
  }
}
