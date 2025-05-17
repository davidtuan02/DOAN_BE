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
      console.log('Register request body:', body);
      
      // Explicitly check for required fullName
      if (!body.fullName) {
        throw new Error('fullName is required');
      }
      
      return await this.usersService.createUser(body);
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific database errors more gracefully
      if (error.message && error.message.includes('violates not-null constraint')) {
        const errorMessage = `Missing required fields: ${error.message}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      throw error;
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
