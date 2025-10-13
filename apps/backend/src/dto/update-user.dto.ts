import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * DTO pour la mise à jour d'utilisateur
 * Tous les champs sont optionnels
 */
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  name?: string;

  @IsEmail({}, { message: 'Email invalide' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  password?: string;
}
