# Guide d'utilisation de la validation backend

## 📝 Vue d'ensemble

Le backend utilise maintenant **class-validator** et **class-transformer** pour valider automatiquement toutes les données entrantes.

---

## 🎯 DTOs disponibles

### CreateUserDto

Utilisé pour créer un nouvel utilisateur.

```typescript
import { CreateUserDto } from '../dto';

@Post()
async create(@Body() createUserDto: CreateUserDto) {
  // Les données sont déjà validées ici
  return this.userService.create(createUserDto);
}
```

**Validation automatique :**

- `name` : Chaîne de caractères, minimum 2 caractères
- `email` : Format email valide
- `password` : Chaîne de caractères, minimum 8 caractères

**Exemple de requête valide :**

```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "motdepasse123"
}
```

**Exemple de requête invalide :**

```json
{
  "name": "J",
  "email": "invalid-email",
  "password": "short"
}
```

**Réponse d'erreur :**

```json
{
  "statusCode": 400,
  "message": [
    "Le nom doit contenir au moins 2 caractères",
    "Email invalide",
    "Le mot de passe doit contenir au moins 8 caractères"
  ],
  "error": "Bad Request"
}
```

---

### UpdateUserDto

Utilisé pour mettre à jour un utilisateur existant. Tous les champs sont optionnels.

```typescript
import { UpdateUserDto } from '../dto';

@Patch(':id')
async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  return this.userService.update(id, updateUserDto);
}
```

**Validation automatique :**

- `name` (optionnel) : Chaîne de caractères, minimum 2 caractères
- `email` (optionnel) : Format email valide
- `password` (optionnel) : Chaîne de caractères, minimum 8 caractères

**Exemple de requête valide :**

```json
{
  "name": "Jean Dupont"
}
```

ou

```json
{
  "email": "nouveau@example.com",
  "password": "nouveaumotdepasse123"
}
```

---

## 🛠️ Créer un nouveau DTO

### 1. Créer le fichier DTO

```typescript
// src/dto/create-post.dto.ts
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Le titre doit contenir au moins 5 caractères' })
  @MaxLength(100, { message: 'Le titre ne peut pas dépasser 100 caractères' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Le contenu doit contenir au moins 10 caractères' })
  content: string;
}
```

### 2. Utiliser le DTO dans un contrôleur

```typescript
import { CreatePostDto } from '../dto/create-post.dto';

@Controller('posts')
export class PostsController {
  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    // Les données sont automatiquement validées
    return this.postsService.create(createPostDto);
  }
}
```

---

## 🎨 Décorateurs de validation disponibles

### Chaînes de caractères

- `@IsString()` - Vérifie que c'est une chaîne
- `@MinLength(n)` - Longueur minimale
- `@MaxLength(n)` - Longueur maximale
- `@IsNotEmpty()` - Ne peut pas être vide

### Emails et URLs

- `@IsEmail()` - Format email valide
- `@IsUrl()` - Format URL valide

### Nombres

- `@IsNumber()` - Vérifie que c'est un nombre
- `@Min(n)` - Valeur minimale
- `@Max(n)` - Valeur maximale
- `@IsInt()` - Vérifie que c'est un entier
- `@IsPositive()` - Vérifie que c'est positif

### Booléens

- `@IsBoolean()` - Vérifie que c'est un booléen

### Dates

- `@IsDate()` - Vérifie que c'est une date
- `@IsDateString()` - Chaîne au format ISO date

### Optionnels

- `@IsOptional()` - Le champ est optionnel

### Tableaux

- `@IsArray()` - Vérifie que c'est un tableau
- `@ArrayMinSize(n)` - Taille minimale du tableau
- `@ArrayMaxSize(n)` - Taille maximale du tableau

### Objets imbriqués

- `@ValidateNested()` - Valide un objet imbriqué
- `@Type(() => ClassType)` - Transforme en type spécifique

---

## 🧩 Exemples avancés

### DTO avec objet imbriqué

```typescript
import { ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;
}

export class CreateUserWithAddressDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

### DTO avec validation personnalisée

```typescript
import { IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Matches(/^[A-Za-z]+$/, {
    message: 'Le nom ne doit contenir que des lettres',
  })
  name: string;
}
```

### DTO avec validation conditionnelle

```typescript
import { IsString, ValidateIf } from 'class-validator';

export class CreateUserDto {
  @IsString()
  type: 'personal' | 'business';

  @ValidateIf((o) => o.type === 'business')
  @IsString()
  companyName?: string;
}
```

---

## 🔧 Configuration du ValidationPipe

La configuration actuelle dans `main.ts` :

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Supprime les propriétés non définies dans le DTO
    forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés non autorisées
    transform: true, // Transforme automatiquement les types
  }),
);
```

### Options disponibles

- `whitelist: true` - Supprime automatiquement les propriétés qui ne sont pas dans le DTO
- `forbidNonWhitelisted: true` - Retourne une erreur si des propriétés non autorisées sont envoyées
- `transform: true` - Transforme les données (ex: `"123"` → `123` si c'est un nombre)
- `disableErrorMessages: false` - Affiche ou non les messages d'erreur de validation
- `skipMissingProperties: false` - Skip la validation des propriétés manquantes

---

## 🚀 Tests avec validation

```typescript
import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should reject invalid email', async () => {
    const invalidDto = {
      name: 'Test',
      email: 'invalid-email',
      password: 'password123',
    };

    await expect(controller.create(invalidDto)).rejects.toThrow();
  });
});
```

---

## 📚 Ressources

- [Documentation class-validator](https://github.com/typestack/class-validator)
- [Documentation NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [class-transformer Documentation](https://github.com/typestack/class-transformer)

---

## ✅ Bonnes pratiques

1. **Toujours créer un DTO** pour les données entrantes
2. **Utiliser des messages d'erreur clairs** en français
3. **Valider côté backend ET frontend** (défense en profondeur)
4. **Utiliser @IsOptional()** pour les champs optionnels
5. **Créer des DTOs séparés** pour create/update (ex: CreateUserDto, UpdateUserDto)
6. **Utiliser whitelist: true** pour éviter les propriétés non attendues
7. **Tester la validation** dans les tests unitaires
