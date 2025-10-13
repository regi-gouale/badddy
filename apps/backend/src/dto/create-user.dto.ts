import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO pour la création d'utilisateur
 * Utilisé pour valider les données d'entrée
 */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  name: string;

  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  password: string;
}
