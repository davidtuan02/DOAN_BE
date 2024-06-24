import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UserDTO, UserToProjectoDTO, UserUpdateDTO } from '../dto/user.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleDecorator } from 'src/auth/decorators/roles.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';

@Controller('users')
@UseGuards(AuthGuard, RoleGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  public async register(@Body() body: UserDTO): Promise<UserDTO> {
    return await this.usersService.create(body);
  }

  @Get('all')
  public async getAll(): Promise<UserDTO[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  public async getById(@Param('id') id: string): Promise<UserDTO> {
    return await this.usersService.findById(id);
  }

  @Put('edit/:id')
  @RoleDecorator('ADMIN')
  public async update(@Body() body: UserUpdateDTO, @Param('id') id: string) {
    return await this.usersService.update(body, id);
  }

  @Delete('delete/:id')
  @RoleDecorator('ADMIN')
  public async delete(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }

  @Post('add-to-project')
  @RoleDecorator('ADMIN')
  public async addRelation(@Body() body: UserToProjectoDTO) {
    return await this.usersService.addRelation(body);
  }
}
