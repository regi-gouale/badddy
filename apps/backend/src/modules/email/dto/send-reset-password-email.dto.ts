import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SendResetPasswordEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  resetUrl: string;
}
