import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { AccessLevel } from '../../auth/decorators/access-level.decorator';
import { AdminAccess } from '../../auth/decorators/admin.decorator';
import { PublicAccess } from '../../auth/decorators/public.decorator';
import { AccessLevelGuard } from '../../auth/guards/access-level.guard';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/role.guard';
import { ProjectsEntity } from '../../projects/entities/projects.entity';
import { UserDTO, UserToProjectDTO, UserUpdateDTO } from '../dto/user.dto';
import { UsersService } from '../services/users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard, RolesGuard, AccessLevelGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @PublicAccess()
  @Post('create')
  public async registerUser(@Body() body: UserDTO) {
    try {
      // Log the request body for debugging
      console.log('Register request body:', JSON.stringify(body, null, 2));
      
      // Validate required fields
      if (!body.firstName) {
        throw new Error('firstName is required');
      }
      if (!body.email) {
        throw new Error('email is required');
      }
      if (!body.username) {
        throw new Error('username is required');
      }
      if (!body.password) {
        throw new Error('password is required');
      }
      if (!body.age) {
        throw new Error('age is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password length
      if (body.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Validate age
      if (body.age < 18) {
        throw new Error('Age must be at least 18');
      }

      console.log('All validations passed, calling createUser service...');
      const result = await this.usersService.createUser(body);
      console.log('Registration successful:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      
      // Handle specific database errors
      if (error.message && error.message.includes('violates not-null constraint')) {
        throw new Error(`Missing required fields: ${error.message}`);
      }
      if (error.message && error.message.includes('duplicate key')) {
        throw new Error('Email or username already exists');
      }
      
      // Handle validation errors
      if (error.message && (
        error.message.includes('is required') ||
        error.message.includes('Invalid email format') ||
        error.message.includes('Password must be') ||
        error.message.includes('Age must be')
      )) {
        throw new Error(error.message);
      }

      // For any other errors
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  @PublicAccess()
  @ApiHeader({
    name: 'tasks_token',
  })
  @Get('all')
  public async findAllUsers() {
    return await this.usersService.findUsers();
  }

  @ApiParam({
    name: 'id',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @PublicAccess()
  @Get(':id')
  public async findUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findUserById(id);
  }

  @ApiParam({
    name: 'projectId',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @AccessLevel('OWNER')
  @Post('add-to-project/:projectId')
  public async addToProject(
    @Body() body: UserToProjectDTO,
    @Param('projectId', new ParseUUIDPipe()) id: string,
  ) {
    return await this.usersService.relationToProject({
      ...body,
      project: id as unknown as ProjectsEntity,
    });
  }

  @ApiParam({
    name: 'id',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @Put('edit/:id')
  public async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UserUpdateDTO,
  ) {
    return await this.usersService.updateUser(body, id);
  }

  @ApiParam({
    name: 'id',
  })
  @ApiHeader({
    name: 'tasks_token',
  })
  @Delete('delete/:id')
  public async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.deleteUser(id);
  }
}
