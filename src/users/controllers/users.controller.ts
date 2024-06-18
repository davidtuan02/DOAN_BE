import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  // Redirect,
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get() // el decorador Get es requerido
  @HttpCode(200) // manipular el código de la respuesta
  findAll(@Body() req: Request): string {
    if (req === undefined) return 'no users';
    return 'all users';
  }

  @Get('1') // el prefijo es opcional para concatenar a la ruta del controlador
  // @Redirect('https://nestjs.com', 301)
  findOne(): string {
    return 'one users';
  }

  @Post()
  create(): string {
    return 'This action adds a new cat';
  }
}
