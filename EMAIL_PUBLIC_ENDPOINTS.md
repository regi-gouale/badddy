# 🔒 Endpoints Email - Sécurité et Accès

## Problème résolu : Erreur 401 sur `/api/v1/email/reset-password`

### ❌ Problème initial

L'endpoint `/api/v1/email/reset-password` retournait une erreur 401 (Non autorisé) car :

- Le contrôleur `EmailController` avait `@UseGuards(JwtAuthGuard)` au niveau de la classe
- **Tous** les endpoints nécessitaient donc une authentification JWT
- Or, un utilisateur qui demande une réinitialisation de mot de passe **n'est pas connecté** !

### ✅ Solution appliquée

Ajout du décorateur `@Public()` sur les endpoints qui doivent être accessibles sans authentification.

## 📊 Classification des endpoints

### 🌐 Endpoints PUBLICS (sans JWT requis)

Ces endpoints sont accessibles **sans authentification** car ils sont utilisés avant/pendant le processus de connexion :

| Endpoint                            | Raison                                                               |
| ----------------------------------- | -------------------------------------------------------------------- |
| `POST /api/v1/email/verification`   | L'utilisateur vient de s'inscrire, il n'est pas encore connecté      |
| `POST /api/v1/email/reset-password` | L'utilisateur a oublié son mot de passe, il ne peut pas se connecter |

**Décorateur ajouté** :

```typescript
@Public()
@Post('verification')
async sendVerificationEmail(...) { ... }

@Public()
@Post('reset-password')
async sendResetPasswordEmail(...) { ... }
```

### 🔒 Endpoints PROTÉGÉS (JWT requis)

Ces endpoints nécessitent une **authentification JWT** car ils concernent des utilisateurs connectés :

| Endpoint                     | Raison                                                         |
| ---------------------------- | -------------------------------------------------------------- |
| `POST /api/v1/email/send`    | Email générique envoyé par un utilisateur connecté             |
| `POST /api/v1/email/welcome` | Email de bienvenue envoyé après activation (processus interne) |

## 🔧 Implémentation technique

### Décorateur @Public()

**Fichier** : `apps/backend/src/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### Guard JwtAuthGuard

Le guard vérifie la présence de la métadonnée `isPublic` :

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Pas de vérification JWT
    }

    // Vérification JWT normale
    // ...
  }
}
```

## 🎯 Cas d'usage

### 1. Inscription (endpoint public)

```typescript
// Frontend - Inscription
async function handleSignup(email: string, name: string, password: string) {
  // 1. Créer le compte (Better Auth)
  const user = await createAccount(email, password);

  // 2. Envoyer l'email de vérification (SANS JWT - endpoint public)
  await fetch("/api/v1/email/verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: email,
      userName: name,
      verificationUrl: `${origin}/verify?token=${user.verificationToken}`,
    }),
  });
}
```

### 2. Mot de passe oublié (endpoint public)

```typescript
// Frontend - Reset password
async function handleForgotPassword(email: string) {
  // 1. Demander un token de réinitialisation
  const response = await fetch("/api/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  const { token, userName } = await response.json();

  // 2. Envoyer l'email (SANS JWT - endpoint public)
  await fetch("/api/v1/email/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: email,
      userName,
      resetUrl: `${origin}/reset-password?token=${token}`,
    }),
  });
}
```

### 3. Email générique (endpoint protégé)

```typescript
// Frontend - Email depuis le dashboard
async function sendCustomEmail(to: string, subject: string, html: string) {
  // Récupérer le JWT token
  const token = await getJWTToken();

  // Envoyer l'email (AVEC JWT - endpoint protégé)
  await fetch("/api/v1/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // JWT requis !
    },
    body: JSON.stringify({ to, subject, html }),
  });
}
```

## 🔒 Considérations de sécurité

### ⚠️ Risques des endpoints publics

Les endpoints publics peuvent être exposés à :

- **Spam** : Envoi massif d'emails
- **Abus** : Utilisation malveillante

### ✅ Protections mises en place

1. **Rate limiting** (10 req/min par IP) - déjà configuré dans `AppModule`
2. **Validation des données** avec class-validator
3. **Logs** de tous les envois d'emails
4. **Vérification du domaine** dans useSend

### 🛡️ Protections supplémentaires recommandées

Pour les endpoints publics, considérez d'ajouter :

```typescript
// Throttler personnalisé pour les endpoints publics
@Public()
@Throttle({ default: { limit: 3, ttl: 60000 } }) // Max 3 emails / minute
@Post('reset-password')
async sendResetPasswordEmail(...) { ... }
```

## 📝 Modifications apportées

| Fichier               | Changement                                                              |
| --------------------- | ----------------------------------------------------------------------- |
| `email.controller.ts` | Ajout de `@Public()` sur `verification` et `reset-password`             |
| `email.controller.ts` | Import du décorateur `Public`                                           |
| `email.controller.ts` | Suppression de la réponse 401 dans la doc Swagger des endpoints publics |

## ✅ Résultat

Les logs backend devraient maintenant afficher :

```
POST /api/v1/email/reset-password 200 in 894ms ✅
```

Au lieu de :

```
POST /api/v1/email/reset-password 401 in 10ms ❌
```

## 🧪 Test

Pour tester l'endpoint reset-password sans JWT :

```bash
curl -X POST http://localhost:8080/api/v1/email/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "userName": "John Doe",
    "resetUrl": "https://app.badddy.com/reset-password?token=abc123"
  }'
```

**Résultat attendu** : 200 OK (sans besoin de JWT)

---

**Problème résolu !** ✅ Les endpoints publics sont maintenant accessibles sans authentification.
