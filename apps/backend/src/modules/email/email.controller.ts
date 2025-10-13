import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
  SendEmailDto,
  SendResetPasswordEmailDto,
  SendVerificationEmailDto,
  SendWelcomeEmailDto,
} from './dto';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Endpoint générique pour envoyer un email personnalisé
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer un email personnalisé' })
  @ApiResponse({
    status: 200,
    description: 'Email envoyé avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async sendEmail(@Body() dto: SendEmailDto): Promise<{ message: string }> {
    await this.emailService.sendEmail(dto.to, dto.subject, dto.html, dto.text);
    return { message: 'Email envoyé avec succès' };
  }

  /**
   * Envoie un email de vérification de compte
   */
  @Public() // Endpoint public car l'utilisateur n'est pas encore connecté lors de l'inscription
  @Post('verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Envoyer un email de vérification d'inscription" })
  @ApiResponse({
    status: 200,
    description: 'Email de vérification envoyé avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  async sendVerificationEmail(
    @Body() dto: SendVerificationEmailDto,
  ): Promise<{ message: string }> {
    await this.emailService.sendVerificationEmail(
      dto.to,
      dto.userName,
      dto.verificationUrl,
    );
    return { message: 'Email de vérification envoyé avec succès' };
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  @Public() // Endpoint public car l'utilisateur a oublié son mot de passe
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Envoyer un email de réinitialisation de mot de passe',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de réinitialisation envoyé avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  async sendResetPasswordEmail(
    @Body() dto: SendResetPasswordEmailDto,
  ): Promise<{ message: string }> {
    await this.emailService.sendResetPasswordEmail(
      dto.to,
      dto.userName,
      dto.resetUrl,
    );
    return { message: 'Email de réinitialisation envoyé avec succès' };
  }

  /**
   * Envoie un email de bienvenue
   */
  @Post('welcome')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer un email de bienvenue' })
  @ApiResponse({
    status: 200,
    description: 'Email de bienvenue envoyé avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async sendWelcomeEmail(
    @Body() dto: SendWelcomeEmailDto,
  ): Promise<{ message: string }> {
    await this.emailService.sendWelcomeEmail(dto.to, dto.userName);
    return { message: 'Email de bienvenue envoyé avec succès' };
  }
}
