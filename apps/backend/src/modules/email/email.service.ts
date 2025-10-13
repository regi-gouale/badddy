import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UseSend } from 'usesend-js';
import { EmailTemplates } from './templates/email.templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly useSend: UseSend;
  private readonly fromEmail = 'No Reply Badddy<noreply@cotizoo.com>';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('USESEND_APIKEY');
    if (!apiKey) {
      this.logger.error('USESEND_APIKEY not found in environment variables');
      throw new Error('USESEND_APIKEY is required');
    }
    this.useSend = new UseSend(apiKey);
    this.logger.log('EmailService initialized successfully');
  }

  /**
   * Envoie un email générique
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    try {
      this.logger.log(`Sending email to ${to} with subject: ${subject}`);
      await this.useSend.emails.send({
        to,
        from: this.fromEmail,
        subject,
        html,
        text: text || this.stripHtml(html),
      });
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  /**
   * Envoie un email de vérification de compte
   */
  async sendVerificationEmail(
    to: string,
    userName: string,
    verificationUrl: string,
  ): Promise<void> {
    const subject = 'Vérifiez votre compte Badddy';
    const html = EmailTemplates.verification(userName, verificationUrl);

    return this.sendEmail(to, subject, html);
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendResetPasswordEmail(
    to: string,
    userName: string,
    resetUrl: string,
  ): Promise<void> {
    const subject = 'Réinitialisation de votre mot de passe';
    const html = EmailTemplates.resetPassword(userName, resetUrl);

    return this.sendEmail(to, subject, html);
  }

  /**
   * Envoie un email de bienvenue
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    const subject = 'Bienvenue sur Badddy ! 🎉';
    const html = EmailTemplates.welcome(userName);

    return this.sendEmail(to, subject, html);
  }

  /**
   * Envoie une notification générique
   */
  async sendNotification(
    to: string,
    userName: string,
    title: string,
    message: string,
  ): Promise<void> {
    const html = EmailTemplates.notification(userName, title, message);

    return this.sendEmail(to, title, html);
  }

  /**
   * Retire les balises HTML d'une chaîne (pour la version texte)
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
