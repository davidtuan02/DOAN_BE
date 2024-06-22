import { IsNotEmpty, IsString } from 'class-validator';
import { ILogin } from '../interfaces/login.interface';

export class AuthDTO implements ILogin {
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
