import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SendVerificationEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  verificationUrl: string;
}
