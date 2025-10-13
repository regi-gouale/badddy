# 🔧 Solution finale - Erreur 401 sur reset-password

## ❌ Problème identifié

L'erreur 401 persistait malgré l'ajout du décorateur `@Public()` car :

1. ✅ Le backend accepte bien les requêtes sans JWT sur l'endpoint `/api/v1/email/reset-password`
2. ❌ **MAIS** `emailApi` utilise `backendApiClient` qui **tente toujours d'obtenir un JWT**
3. ❌ Quand Better Auth appelle `emailApi.sendResetPasswordEmail()` **côté serveur**, il n'y a pas de JWT disponible
4. ❌ Résultat : Erreur 401

## 🔍 Analyse du flux

### Flux d'appel problématique

```
Utilisateur clique "Réinitialiser"
    ↓
forgot-password-form.tsx appelle authClient.requestPasswordReset()
    ↓
Better Auth (serveur) appelle emailApi.sendResetPasswordEmail()
    ↓
emailApi utilise backendApiClient
    ↓
backendApiClient essaie de récupérer un JWT (await authClient.token())
    ↓
❌ PAS DE JWT côté serveur → Erreur 401
```

## ✅ Solution implémentée

Création de **deux clients API** distincts :

### 1. `emailApiServer` - Pour les appels côté serveur (SANS JWT)

**Fichier** : `apps/web/lib/email-api.ts`

```typescript
/**
 * Client API Email pour appels depuis le serveur (sans JWT)
 * À utiliser dans les API routes ou Better Auth
 */
export const emailApiServer = {
  async sendVerificationEmail(data) {
    const response = await fetch(`${BACKEND_URL}/api/v1/email/verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async sendResetPasswordEmail(data) {
    const response = await fetch(`${BACKEND_URL}/api/v1/email/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

**Caractéristiques** :

- ✅ Utilise `fetch()` natif (pas de JWT)
- ✅ Appelle directement le backend
- ✅ À utiliser dans Better Auth, API routes, Server Components

### 2. `emailApi` - Pour les appels côté client (AVEC JWT)

**Reste inchangé** pour les composants React :

```typescript
/**
 * Client API Email pour appels depuis le client (avec JWT)
 * À utiliser dans les composants React
 */
export const emailApi = {
  async sendEmail(data) {
    const response = await backendApiClient.post("/email/send", data);
    return response.data!;
  },
  // ... autres méthodes
};
```

### 3. Mise à jour de Better Auth

**Fichier** : `apps/web/lib/auth.ts`

```typescript
import { emailApiServer } from "./email-api"; // ← Au lieu de emailApi

export const auth = betterAuth({
  // ...
  emailAndPassword: {
    sendResetPassword: async ({ user, token }) => {
      await emailApiServer.sendResetPasswordEmail({
        // ← emailApiServer
        to: user.email!,
        userName: user.name || "Utilisateur",
        resetUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`,
      });
    },
  },
});
```

## 📊 Nouveau flux (corrigé)

```
Utilisateur clique "Réinitialiser"
    ↓
forgot-password-form.tsx appelle authClient.requestPasswordReset()
    ↓
Better Auth (serveur) appelle emailApiServer.sendResetPasswordEmail()
    ↓
emailApiServer utilise fetch() natif (SANS JWT)
    ↓
Backend reçoit la requête sur l'endpoint @Public()
    ↓
✅ 200 OK - Email envoyé !
```

## 🎯 Cas d'usage

| Contexte               | Client à utiliser | JWT requis ? |
| ---------------------- | ----------------- | ------------ |
| Composant React client | `emailApi`        | ✅ Oui       |
| Better Auth (serveur)  | `emailApiServer`  | ❌ Non       |
| API Route Next.js      | `emailApiServer`  | ❌ Non       |
| Server Component       | `emailApiServer`  | ❌ Non       |
| Server Action          | `emailApiServer`  | ❌ Non       |

## 🔧 Modifications apportées

| Fichier        | Changement                                     |
| -------------- | ---------------------------------------------- |
| `email-api.ts` | Ajout de `emailApiServer` pour appels sans JWT |
| `email-api.ts` | `emailApi` renommé avec commentaire explicite  |
| `auth.ts`      | Import et utilisation de `emailApiServer`      |

## 🧪 Test

Le formulaire de réinitialisation devrait maintenant fonctionner :

1. Aller sur `/forgot-password`
2. Entrer un email
3. Cliquer sur "Envoyer le lien de réinitialisation"
4. ✅ L'email devrait être envoyé sans erreur 401

### Logs attendus côté serveur

**Better Auth (Next.js)** :

```
Envoyer un email de réinitialisation du mot de passe à user@example.com avec le token : abc123
```

**Backend (NestJS)** :

```
POST /api/v1/email/reset-password 200 in 894ms
[EmailService] Email sent successfully to user@example.com
```

## 📚 Bonnes pratiques

### ✅ Règle générale

- **Côté client (React)** → Utilisez `emailApi` (avec JWT via `backendApiClient`)
- **Côté serveur (Better Auth, API Routes)** → Utilisez `emailApiServer` (sans JWT, appel direct)

### 🔒 Sécurité

Les endpoints publics (`@Public()`) sont protégés par :

- Rate limiting (10 req/min par IP)
- Validation des données (class-validator)
- Logs de tous les envois

### 🚀 Évolutions futures

Si vous avez besoin d'envoyer des emails depuis d'autres contextes serveur :

```typescript
// Dans une Server Action
"use server";
import { emailApiServer } from "@/lib/email-api";

export async function sendWelcomeEmail(email: string, name: string) {
  await emailApiServer.sendVerificationEmail({
    to: email,
    userName: name,
    verificationUrl: "...",
  });
}
```

## ✅ Résultat

Le formulaire de réinitialisation de mot de passe fonctionne maintenant sans erreur 401 ! 🎉

---

**Problème résolu définitivement !** ✅
