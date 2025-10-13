import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    [key: string]: unknown;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private jwksUrl: string;
  private JWKS: any;
  private joseModule: any;

  constructor(private reflector: Reflector) {
    // URL du service web où Better Auth expose les clés publiques
    const webServiceUrl =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      process.env.BETTER_AUTH_URL ||
      'http://localhost:3000';
    this.jwksUrl = `${webServiceUrl}/api/auth/jwks`;
  }

  private async initializeJose() {
    if (!this.joseModule) {
      // Import dynamique de jose pour supporter ESM dans CommonJS
      this.joseModule = await import('jose');
      this.JWKS = this.joseModule.createRemoteJWKSet(new URL(this.jwksUrl));
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Initialise jose si ce n'est pas déjà fait
    await this.initializeJose();

    // Vérifie si la route est publique
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers['authorization'];

    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Valide le JWT en utilisant les clés publiques du JWKS endpoint
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const { payload } = await this.joseModule.jwtVerify(token, this.JWKS, {
        issuer: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      });

      // Attache les informations de l'utilisateur à la requête
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      request.user = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        id: (payload.sub as string) || '',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        email: (payload.email as string) || '',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        name: (payload.name as string) || '',
        ...payload,
      };

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException(
        `Invalid or expired token: ${errorMessage}`,
      );
    }
  }
}
