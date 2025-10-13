import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { User } from '../types/user.interface';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  @Get('me')
  @ApiOperation({
    summary: 'Récupérer le profil utilisateur',
    description:
      "Retourne les informations du profil de l'utilisateur authentifié. " +
      'Nécessite un token JWT valide.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur récupéré avec succès',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Authenticated user profile',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'user_123abc' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié - Token JWT manquant ou invalide',
  })
  @ApiResponse({
    status: 429,
    description: 'Trop de requêtes - Rate limit dépassé (10 req/min)',
  })
  getProfile(@CurrentUser() user: User) {
    return {
      message: 'Authenticated user profile',
      user,
    };
  }
}
