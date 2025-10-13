import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendWelcomeEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  userName: string;
}
