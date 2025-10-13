# 🔧 Fix - Bad Request 400 sur reset-password

## ❌ Problème identifié

L'erreur **Bad Request 400** était causée par une validation DTO échouée :

### Validation DTO backend

```typescript
// apps/backend/src/modules/email/dto/send-reset-password-email.dto.ts
export class SendResetPasswordEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsUrl() // ← Cette validation échoue !
  @IsNotEmpty()
  resetUrl: string;
}
```

### Génération de l'URL côté Better Auth

```typescript
// apps/web/lib/auth.ts
sendResetPassword: async ({ user, token }) => {
  await emailApiServer.sendResetPasswordEmail({
    to: user.email!,
    userName: user.name || "Utilisateur",
    resetUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`,
    //            ^^^^^^^^^^^^^^^^^^^^^^^^^^^ UNDEFINED !
  });
};
```

### Résultat

- `process.env.NEXT_PUBLIC_BASE_URL` = **undefined**
- `resetUrl` = `"undefined/reset-password?token=abc123"`
- `@IsUrl()` validation **échoue** ❌
- Backend retourne **400 Bad Request**

## ✅ Solution

### 1. Ajouter la variable manquante

**Fichier** : `apps/web/.env`

```bash
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 2. Mettre à jour turbo.json

**Fichier** : `turbo.json`

Ajouter dans les deux sections `build` et `deploy-build` :

```json
{
  "env": [
    "BETTER_AUTH_URL",
    "NEXT_PUBLIC_BASE_URL", // ← Ajouté
    "NEXT_PUBLIC_BETTER_AUTH_URL", // ← Ajouté
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "USESEND_APIKEY",
    "BACKEND_INTERNAL_URL"
  ]
}
```

**Pourquoi turbo.json ?**

- Turbo utilise cette liste pour savoir quelles variables d'environnement affectent le cache
- Sans ça, les builds peuvent utiliser des valeurs obsolètes

### 3. Redémarrer le serveur Next.js

```bash
# Arrêter le serveur
Ctrl+C

# Redémarrer
pnpm --filter web dev
```

**Important** : Next.js ne recharge pas automatiquement les variables `NEXT_PUBLIC_*` ! Il faut redémarrer.

## 🎯 Validation

Après ces changements, l'URL générée sera :

```
http://localhost:3000/reset-password?token=abc123...
```

Et passera la validation `@IsUrl()` ✅

## 🧪 Test

1. Allez sur `/forgot-password`
2. Entrez un email valide
3. Cliquez sur "Envoyer le lien"
4. ✅ **Plus d'erreur 400 !**

### Logs attendus

**Console Next.js** :

```
Envoyer un email de réinitialisation du mot de passe à user@example.com avec le token : abc123...
```

**Backend NestJS** :

```
POST /api/v1/email/reset-password 200 in 234ms
[EmailService] Email sent successfully to user@example.com
```

**Response backend** :

```json
{
  "message": "Email de réinitialisation envoyé avec succès"
}
```

## 📋 Variables d'environnement complètes

Voici toutes les variables nécessaires pour le projet :

### Frontend (apps/web/.env)

```bash
# Better Auth
BETTER_AUTH_SECRET="U0VRbqSyNwRI2ni96ekPjVIWAAjaPmg1"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# Base URL (pour les emails, callbacks, etc.)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://app:app@localhost:5432/app?schema=public"
REDIS_URL="redis://localhost:6379"

# Backend API
BACKEND_INTERNAL_URL="http://localhost:8080"

# Email (useSend)
USESEND_APIKEY="us_k6pxfrxupn_f47d253b05e9a1cf5e95327587a5047f"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Postgres (pour Docker)
POSTGRES_USER="app"
POSTGRES_PASSWORD="app"
POSTGRES_DB="app"
```

### Backend (apps/backend/.env)

```bash
# Backend n'a pas besoin de NEXT_PUBLIC_BASE_URL
# Il récupère seulement USESEND_APIKEY via ConfigService
USESEND_APIKEY="us_k6pxfrxupn_f47d253b05e9a1cf5e95327587a5047f"
```

## 🎓 Leçons apprises

1. **Variables `NEXT_PUBLIC_*`** : Nécessitent un redémarrage du serveur Next.js
2. **Validation DTO** : `@IsUrl()` exige une URL complète et valide
3. **Turbo cache** : Lister les variables d'environnement dans `turbo.json`
4. **Debugging** : Toujours vérifier les logs backend pour les erreurs de validation

## ✅ Résultat

L'erreur **Bad Request 400** est maintenant corrigée ! 🎉

Le formulaire de réinitialisation envoie correctement les emails avec une URL valide.
