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
import { ApiHeader, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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
    return await this.usersService.createUser(body);
  }

  @AdminAccess()
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
  @ApiResponse({
    status: 400,
    description: 'No se encontro resultado',
  })
  @Get(':id')
  public async findUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findUserById(id);
  }

  @ApiParam({
    name: 'projectId',
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
  @Delete('delete/:id')
  public async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.deleteUser(id);
  }
}
