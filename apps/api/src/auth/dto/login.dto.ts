import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
