# ✅ Fix - URL invalide dans reset-password

## 🎯 Problème identifié

L'erreur de validation était causée par une **URL incorrecte** :

### ❌ Avant (invalide)
```
http://localhost:3000/api/v1/reset-password?token=abc123
                      ^^^^^^^^ ERREUR !
```

### ✅ Après (correct)
```
http://localhost:3000/reset-password?token=abc123
```

## 🔍 Analyse des logs

Les logs détaillés ont révélé le problème :

```json
{
  "to": "regi@gouale.com",
  "userName": "regi",
  "resetUrl": "http://localhost:3000/api/v1/reset-password?token=..."
}
```

**Erreur de validation** : `"resetUrl must be a URL address"`

### Pourquoi l'URL était considérée comme invalide ?

Le validateur `@IsUrl()` de NestJS considère cette URL comme **invalide** car :
- `/api/v1` est le **préfixe des endpoints backend**
- La page frontend de réinitialisation est à `/reset-password`
- Confusion entre **endpoint API** et **page frontend**

## ✅ Solution

**Fichier** : `apps/web/lib/auth.ts`

```typescript
sendResetPassword: async ({ user, token }) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  //                                                     ^^^ Sans /api/v1 !
  
  console.log(`📧 Envoi email de réinitialisation du mot de passe à ${user.email}`);
  console.log(`🔗 Reset URL: ${resetUrl}`);
  
  await emailApiServer.sendResetPasswordEmail({
    to: user.email!,
    userName: user.name || "Utilisateur",
    resetUrl,
  });
},
```

## 📋 Distinction importante

| Type | Chemin | Usage |
|------|--------|-------|
| **Endpoint API Backend** | `/api/v1/email/reset-password` | Pour envoyer l'email via NestJS |
| **Page Frontend** | `/reset-password` | Pour que l'utilisateur clique dans l'email |

### Flux complet

1. Utilisateur soumet le formulaire `/forgot-password`
2. Better Auth génère un token
3. Backend envoie un email avec le lien : `http://localhost:3000/reset-password?token=abc123`
4. Utilisateur clique sur le lien dans l'email
5. Affiche la page `/reset-password` (Next.js)
6. Utilisateur entre son nouveau mot de passe
7. Soumission à Better Auth pour mise à jour

## ⚠️ Page manquante

La page `/reset-password` n'existe pas encore ! Il faut la créer :

```bash
apps/web/app/(auth)/reset-password/page.tsx
```

Cette page devra :
- Récupérer le token depuis l'URL (`?token=...`)
- Afficher un formulaire pour entrer le nouveau mot de passe
- Appeler `authClient.resetPassword({ token, newPassword })`

## 🧪 Test

Testez maintenant le formulaire `/forgot-password` :

1. Entrez votre email
2. Cliquez sur "Envoyer le lien"
3. ✅ **Plus d'erreur 400 !**
4. L'email devrait être envoyé avec succès

### Logs attendus

**Frontend** :
```
📧 Envoi email de réinitialisation du mot de passe à regi@gouale.com
🔗 Reset URL: http://localhost:3000/reset-password?token=abc123...
```

**Backend** :
```
POST /api/v1/email/reset-password 200 in 234ms
[EmailService] Email sent successfully to regi@gouale.com
```

## 📝 Prochaines étapes

1. ✅ Tester l'envoi d'email (devrait maintenant fonctionner)
2. ⏳ Créer la page `/reset-password`
3. ⏳ Implémenter le formulaire de réinitialisation
4. ⏳ Tester le flux complet end-to-end

## 🎉 Résultat

L'erreur **"resetUrl must be a URL address"** est maintenant corrigée ! L'URL générée est valide et passe la validation `@IsUrl()`.
