import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthDTO } from '../dto/auth.dto';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { IRequestWithUser } from '../../interfaces/request-with-user.interface';
import { UserUpdateDTO } from '../../users/dto/user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() { username, password }: AuthDTO) {
    const userValidate = await this.authService.validateUser(
      username,
      password,
    );

    if (!userValidate) {
      throw new UnauthorizedException('Data not valid');
    }

    const jwt = await this.authService.generateJWT(userValidate);

    return jwt;
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset instructions sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiHeader({
    name: 'tasks_token',
  })
  async getProfile(@Req() request: IRequestWithUser) {
    return this.authService.getProfile(request.user.sub);
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiHeader({
    name: 'tasks_token',
  })
  async updateProfile(
    @Req() request: IRequestWithUser,
    @Body() userData: UserUpdateDTO,
  ) {
    return this.authService.updateProfile(request.user.sub, userData);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiHeader({
    name: 'tasks_token',
  })
  async changePassword(
    @Req() request: IRequestWithUser,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      request.user.sub,
      body.currentPassword,
      body.newPassword,
    );
  }
}
