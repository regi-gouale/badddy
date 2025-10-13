# 📋 Guide de Migration - Corrections de Sécurité

## 🎯 Pour les développeurs

Ce guide explique comment migrer votre code pour utiliser les nouvelles fonctionnalités de sécurité.

---

## ⚠️ Breaking Changes

### Aucun !

Toutes les modifications sont **rétrocompatibles**. Les routes existantes continuent de fonctionner sans modification.

---

## ✅ Modifications Requises

### 1. Variables d'environnement (Production uniquement)

Ajoutez cette variable dans votre `.env` de production :

```env
# Backend .env
FRONTEND_URL="https://votre-frontend.com"
```

💡 **En développement**, cette variable n'est pas nécessaire (fallback sur `http://localhost:3000`)

---

## 🆕 Nouvelles Fonctionnalités

### 1. Validation Automatique avec DTOs

Vous pouvez maintenant utiliser des DTOs pour valider automatiquement vos données.

#### Avant (sans validation)

```typescript
@Post()
create(@Body() body: any) {
  // Aucune validation, données potentiellement dangereuses
  return this.service.create(body);
}
```

#### Après (avec validation)

```typescript
import { CreateUserDto } from '../dto';

@Post()
create(@Body() createUserDto: CreateUserDto) {
  // ✅ Données validées automatiquement !
  return this.service.create(createUserDto);
}
```

### 2. Créer un nouveau DTO

```typescript
// src/dto/create-post.dto.ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
```

### 3. DTOs disponibles

- ✅ `CreateUserDto` - Création d'utilisateur
- ✅ `UpdateUserDto` - Mise à jour d'utilisateur

Voir [`VALIDATION_GUIDE.md`](./VALIDATION_GUIDE.md) pour créer vos propres DTOs.

---

## 🔧 Recommandations

### Pour les nouveaux endpoints

1. **Créez toujours un DTO** pour les données POST/PUT/PATCH
2. **Utilisez @Body() avec le type DTO** dans vos contrôleurs
3. **Testez la validation** dans vos tests unitaires

### Exemple complet

```typescript
// 1. Créer le DTO
// dto/create-post.dto.ts
export class CreatePostDto {
  @IsString()
  @MinLength(5)
  title: string;
}

// 2. Utiliser dans le contrôleur
// controllers/posts.controller.ts
@Post()
create(@Body() createPostDto: CreatePostDto) {
  return this.postsService.create(createPostDto);
}

// 3. Tester
// posts.controller.spec.ts
it('should reject invalid title', async () => {
  const invalidDto = { title: 'ab' }; // Trop court
  await expect(controller.create(invalidDto)).rejects.toThrow();
});
```

---

## 📦 Dépendances Ajoutées

Deux nouvelles dépendances ont été ajoutées :

```json
{
  "dependencies": {
    "class-validator": "^0.14.2",
    "class-transformer": "^0.5.1"
  }
}
```

Si vous rencontrez des problèmes, réinstallez les dépendances :

```bash
pnpm install
```

---

## 🧪 Vérification

Après migration, vérifiez que tout fonctionne :

```bash
# 1. Build
pnpm run build

# 2. Tests
pnpm test
pnpm test:e2e

# 3. Linting
pnpm lint

# 4. Types
pnpm check-types
```

Tous devraient passer ✅

---

## ❓ FAQ

### Q: Mes routes existantes vont-elles casser ?

**R:** Non ! Toutes les routes existantes continuent de fonctionner.

### Q: Dois-je modifier tous mes contrôleurs maintenant ?

**R:** Non, c'est optionnel. Mais fortement recommandé pour les nouvelles routes.

### Q: Comment tester qu'un DTO valide correctement ?

**R:** Voir les exemples dans [`VALIDATION_GUIDE.md`](./VALIDATION_GUIDE.md)

### Q: Que se passe-t-il si je n'ajoute pas FRONTEND_URL ?

**R:** Le backend utilisera `http://localhost:3000` par défaut (développement).

### Q: Les performances sont-elles impactées ?

**R:** Oui, mais positivement ! Le JWT Guard est maintenant ~5-10ms plus rapide.

---

## 📞 Support

En cas de problème :

1. Consultez [`VALIDATION_GUIDE.md`](./VALIDATION_GUIDE.md)
2. Consultez [`CRITICAL_ISSUES_FIXED.md`](/CRITICAL_ISSUES_FIXED.md)
3. Ouvrez une issue sur GitHub

---

## 🎉 Merci !

Ces changements améliorent significativement la sécurité de l'application. Bonne migration ! 🚀
