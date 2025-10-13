# Backend Authentication avec Better Auth JWT

## Architecture

Le backend NestJS **ne contient pas** Better Auth. L'authentification se fait entièrement côté frontend (Next.js) avec Better Auth.

Le backend valide simplement les JWT tokens générés par Better Auth en utilisant les clés publiques exposées via le endpoint JWKS.

## Comment ça fonctionne

1. **Frontend (Next.js + Better Auth)** :
   - L'utilisateur se connecte via Better Auth
   - Better Auth génère un JWT signé avec une clé privée
   - Le JWT est envoyé au backend dans le header `Authorization: Bearer <token>`

2. **Backend (NestJS)** :
   - Le `JwtAuthGuard` intercepte toutes les requêtes
   - Il extrait le JWT du header Authorization
   - Il valide le JWT en utilisant les clés publiques récupérées depuis `http://localhost:3000/api/auth/jwks`
   - Si le JWT est valide, l'utilisateur est authentifié et les infos sont attachées à `request.user`

## Utilisation

### Routes protégées (par défaut)

Toutes les routes sont protégées par défaut grâce au guard global :

```typescript
@Controller('users')
export class UserController {
  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return { user };
  }
}
```

### Routes publiques

Pour rendre une route publique, utilisez le décorateur `@Public()` :

```typescript
import { Public } from './decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok' };
  }
}
```

### Accéder aux informations de l'utilisateur

Utilisez le décorateur `@CurrentUser()` :

```typescript
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  @Post()
  create(@CurrentUser() user: User, @Body() createPostDto: CreatePostDto) {
    // user.id, user.email, user.name sont disponibles
    return this.postsService.create(user.id, createPostDto);
  }
}
```

## Variables d'environnement

Le backend a besoin de connaître l'URL du service Better Auth pour récupérer les clés JWKS :

```env
# URL du service web Next.js où Better Auth est hébergé
BETTER_AUTH_URL=http://localhost:3000
# ou
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

## Exemple d'appel depuis le frontend

### Avec fetch natif

```typescript
const token = await authClient.token().then((x) => x.data?.token);

const response = await fetch('http://localhost:8080/api/v1/users/me', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Avec un intercepteur Axios

```typescript
import axios from 'axios';
import { authClient } from './auth-client';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
});

// Intercepteur pour ajouter automatiquement le JWT
apiClient.interceptors.request.use(async (config) => {
  const token = await authClient.token().then((x) => x.data?.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Utilisation
const { data } = await apiClient.get('/api/v1/users/me');
```

## Tests

Pour tester une route protégée, vous devez d'abord obtenir un JWT valide depuis le frontend :

```bash
# 1. Se connecter sur le frontend (http://localhost:3000)
# 2. Récupérer le JWT depuis les DevTools (localStorage ou cookie)
# 3. Faire une requête au backend avec le JWT

curl -H "Authorization: Bearer <votre-jwt>" \
  http://localhost:8080/api/v1/users/me
```

## Sécurité

- ✅ Le backend ne stocke **jamais** la clé privée de Better Auth
- ✅ Les JWT sont validés en temps réel via les clés publiques JWKS
- ✅ Les JWT expirés sont automatiquement rejetés
- ✅ Pas besoin d'importer Better Auth dans le backend
- ✅ Architecture découplée : le frontend peut être changé sans toucher au backend
