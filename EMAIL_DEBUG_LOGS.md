# 🔍 Debug - Bad Request 400 (Amélioration des logs)

## 🎯 Objectif

Identifier **exactement** quel champ échoue à la validation en ajoutant des logs détaillés.

## ✅ Modifications apportées

### 1. Backend - Logs de validation détaillés

**Fichier** : `apps/backend/src/main.ts`

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: false, // ← Afficher messages détaillés
    validationError: {
      target: false,
      value: true, // ← Inclure la valeur dans l'erreur
    },
  })
);
```

**Fichier** : `apps/backend/src/filters/all-exceptions.filter.ts`

```typescript
// Log supplémentaire pour les erreurs de validation (BadRequest)
if (status === 400 && typeof message === "object") {
  this.logger.error("Validation details:", JSON.stringify(message, null, 2));
  this.logger.error("Request body:", JSON.stringify(request.body, null, 2));
}
```

### 2. Frontend - Logs de requête détaillés

**Fichier** : `apps/web/lib/email-api.ts`

```typescript
async sendResetPasswordEmail(data) {
  console.log("📧 Envoi email reset-password avec les données:", JSON.stringify(data, null, 2));
  console.log("🔗 URL backend:", BACKEND_URL);

  const response = await fetch(...);

  console.log("📩 Response status:", response.status, response.statusText);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("❌ Error response body:", errorBody);
    throw new Error(...);
  }
}
```

## 🧪 Test

Maintenant, testez à nouveau sur `/forgot-password` et vous verrez :

### Logs Frontend (Console Next.js)

```
📧 Envoi email reset-password avec les données: {
  "to": "regi@gouale.com",
  "userName": "Regi",
  "resetUrl": "http://localhost:3000/reset-password?token=abc123..."
}
🔗 URL backend: http://localhost:8080
📩 Response status: 400 Bad Request
❌ Error response body: {
  "statusCode": 400,
  "message": [
    "resetUrl must be a URL address"  ← LE PROBLÈME !
  ],
  "error": "Bad Request"
}
```

### Logs Backend (Console NestJS)

```
ERROR [AllExceptionsFilter] POST /api/v1/email/reset-password - Status: 400
ERROR [AllExceptionsFilter] Validation details: {
  "statusCode": 400,
  "message": [
    "resetUrl must be a URL address"
  ],
  "error": "Bad Request"
}
ERROR [AllExceptionsFilter] Request body: {
  "to": "regi@gouale.com",
  "userName": "Regi",
  "resetUrl": "undefined/reset-password?token=abc123..."  ← LA CAUSE !
}
```

## 🔎 Hypothèses à vérifier

### 1. `NEXT_PUBLIC_BASE_URL` non chargée

```bash
# Vérifier si la variable est bien définie
cd apps/web
echo $NEXT_PUBLIC_BASE_URL

# Si vide, Next.js n'a pas rechargé les variables
# Solution : Redémarrer Next.js
```

### 2. Problème de cache Turbo

```bash
# Nettoyer le cache et redémarrer
pnpm clean
pnpm dev
```

### 3. Variable définie mais non accessible

```typescript
// Vérifier dans auth.ts
console.log("🔍 NEXT_PUBLIC_BASE_URL =", process.env.NEXT_PUBLIC_BASE_URL);
console.log("🔗 resetUrl =", resetUrl);
```

## 📊 Analyse attendue

Avec ces logs, vous saurez **exactement** :

1. ✅ Quelle valeur est envoyée pour `resetUrl`
2. ✅ Si `NEXT_PUBLIC_BASE_URL` est `undefined`
3. ✅ Quel message d'erreur de validation précis retourne NestJS

## 🚀 Prochaine étape

Une fois les logs visibles, partagez-moi :

- Les logs frontend (console Next.js)
- Les logs backend (console NestJS)

Et on pourra corriger le problème exact ! 🎯
