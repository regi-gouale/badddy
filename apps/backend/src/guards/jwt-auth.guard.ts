import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { User } from '../types/user.interface';

interface AuthenticatedRequest extends Request {
  user?: User;
}

// Singleton pour l'import dynamique de jose (une seule fois au démarrage)
let joseModule: typeof import('jose') | null = null;
let jwksInstance: ReturnType<typeof import('jose').createRemoteJWKSet> | null =
  null;

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly issuer: string;
  private readonly jwksUrl: string;

  constructor(private reflector: Reflector) {
    // URL du service web où Better Auth expose les clés publiques
    const webServiceUrl =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      process.env.BETTER_AUTH_URL ||
      'http://localhost:3000';
    this.jwksUrl = `${webServiceUrl}/api/auth/jwks`;
    this.issuer = webServiceUrl;
  }

  /**
   * Initialise jose une seule fois (singleton pattern)
   * Import dynamique nécessaire car jose est un module ESM
   */
  private async initializeJose(): Promise<void> {
    if (!joseModule) {
      joseModule = await import('jose');
      jwksInstance = joseModule.createRemoteJWKSet(new URL(this.jwksUrl));
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Initialise jose si ce n'est pas déjà fait (une seule fois)
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
      const { payload } = await joseModule!.jwtVerify(token, jwksInstance!, {
        issuer: this.issuer,
      });

      // Validation stricte des données du payload
      const userId = typeof payload.sub === 'string' ? payload.sub : null;
      const userEmail =
        typeof payload.email === 'string' ? payload.email : null;
      const userName = typeof payload.name === 'string' ? payload.name : null;

      if (!userId || !userEmail) {
        throw new UnauthorizedException(
          'Invalid token payload: missing required fields',
        );
      }

      // Attache les informations validées de l'utilisateur à la requête
      request.user = {
        id: userId,
        email: userEmail,
        name: userName || '',
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
