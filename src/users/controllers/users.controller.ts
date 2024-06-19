import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UserDTO, UserUpdateDTO } from '../dto/user.dto';

@Controller('users')
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
  public async update(@Body() body: UserUpdateDTO, @Param('id') id: string) {
    return await this.usersService.update(body, id);
  }
}
