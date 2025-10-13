# 🚀 Guide de démarrage rapide - Module Email

## ✅ Ce qui a été créé

### Backend (NestJS)

```
apps/backend/src/modules/email/
├── dto/
│   ├── send-email.dto.ts
│   ├── send-verification-email.dto.ts
│   ├── send-reset-password-email.dto.ts
│   ├── send-welcome-email.dto.ts
│   └── index.ts
├── templates/
│   └── email.templates.ts
├── email.controller.ts
├── email.service.ts
├── email.service.spec.ts
├── email.module.ts
└── index.ts
```

### Frontend (Next.js)

```
apps/web/
├── lib/
│   └── email-api.ts
├── hooks/
│   └── use-email.ts
└── components/examples/
    └── email-verification-example.tsx
```

## 🎯 Endpoints disponibles

Tous les endpoints sont préfixés par `/api/v1/email` et nécessitent JWT.

| Endpoint                       | Méthode | Description               |
| ------------------------------ | ------- | ------------------------- |
| `/api/v1/email/send`           | POST    | Email générique           |
| `/api/v1/email/verification`   | POST    | Email de vérification     |
| `/api/v1/email/reset-password` | POST    | Email de réinitialisation |
| `/api/v1/email/welcome`        | POST    | Email de bienvenue        |

## 📋 Exemples d'utilisation

### 1. Email de vérification lors de l'inscription

**Backend (signup.controller.ts)** :

```typescript
import { EmailService } from "./modules/email";

@Controller("auth")
export class AuthController {
  constructor(private emailService: EmailService) {}

  @Post("signup")
  async signup(@Body() dto: SignupDto) {
    // 1. Créer l'utilisateur
    const user = await this.usersService.create(dto);

    // 2. Générer un token de vérification
    const token = await this.generateVerificationToken(user.id);

    // 3. Envoyer l'email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    await this.emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationUrl
    );

    return { message: "Inscription réussie. Vérifiez votre email." };
  }
}
```

**Frontend (signup-form.tsx)** :

```typescript
'use client';

import { useSendVerificationEmail } from '@/hooks/use-email';

export function SignupForm() {
  const sendVerification = useSendVerificationEmail();

  const handleSubmit = async (data: FormData) => {
    // Après création du compte via Better Auth
    await sendVerification.mutateAsync({
      to: data.email,
      userName: data.name,
      verificationUrl: `${window.location.origin}/verify?token=${token}`
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### 2. Email de réinitialisation de mot de passe

**Page forgot-password** :

```typescript
'use client';

import { useSendResetPasswordEmail } from '@/hooks/use-email';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const sendReset = useSendResetPasswordEmail();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Générer un token côté backend
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    const { token, userName } = await response.json();

    // 2. Envoyer l'email
    await sendReset.mutateAsync({
      to: email,
      userName,
      resetUrl: `${window.location.origin}/reset-password?token=${token}`
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre email"
      />
      <button disabled={sendReset.isPending}>
        {sendReset.isPending ? 'Envoi...' : 'Réinitialiser'}
      </button>
    </form>
  );
}
```

### 3. Email de bienvenue après vérification

**Route de vérification** :

```typescript
// app/api/verify/route.ts
import { emailApi } from "@/lib/email-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // 1. Vérifier le token
  const user = await verifyToken(token);

  // 2. Activer le compte
  await activateAccount(user.id);

  // 3. Envoyer l'email de bienvenue
  await emailApi.sendWelcomeEmail({
    to: user.email,
    userName: user.name,
  });

  return Response.json({ success: true });
}
```

### 4. Utilisation directe dans un composant Dashboard

```typescript
'use client';

import { useSendWelcomeEmail } from '@/hooks/use-email';
import { Button } from '@/components/ui/button';

export function WelcomeEmailButton({ user }) {
  const sendWelcome = useSendWelcomeEmail();

  return (
    <Button
      onClick={() => sendWelcome.mutate({
        to: user.email,
        userName: user.name
      })}
      disabled={sendWelcome.isPending}
    >
      Envoyer l'email de bienvenue
    </Button>
  );
}
```

## 🧪 Test en local

### 1. Démarrer le backend

```bash
pnpm --filter backend dev
```

### 2. Tester avec curl

```bash
# D'abord, obtenir un token JWT
TOKEN="your_jwt_token_here"

# Envoyer un email de bienvenue
curl -X POST http://localhost:8080/api/v1/email/welcome \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "to": "test@example.com",
    "userName": "John Doe"
  }'
```

### 3. Tester avec le fichier demo.http

Créez un fichier `demo.http` à la racine :

```http
### Envoyer un email de bienvenue
POST http://localhost:8080/api/v1/email/welcome
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

{
  "to": "test@example.com",
  "userName": "Test User"
}

### Envoyer un email de vérification
POST http://localhost:8080/api/v1/email/verification
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

{
  "to": "test@example.com",
  "userName": "Test User",
  "verificationUrl": "http://localhost:3000/verify?token=abc123"
}
```

## 📊 Voir les emails envoyés

1. Connectez-vous au dashboard useSend : https://app.usesend.com
2. Allez dans la section "Emails"
3. Vérifiez les logs d'envoi

## 🔧 Configuration supplémentaire

### Personnaliser l'expéditeur

Dans `email.service.ts`, ligne 12 :

```typescript
private readonly fromEmail = 'Votre Nom<votre@email.com>';
```

### Ajouter un nouveau template

Dans `templates/email.templates.ts` :

```typescript
static monNouveauTemplate(userName: string, data: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <!-- Votre template HTML -->
    </html>
  `;
}
```

### Ajouter un nouvel endpoint

1. Créer le DTO dans `dto/`
2. Ajouter la méthode dans `email.service.ts`
3. Ajouter l'endpoint dans `email.controller.ts`

## 🚨 Troubleshooting

### Erreur: "USESEND_APIKEY is required"

- Vérifiez que `USESEND_APIKEY` est défini dans `apps/backend/.env`
- Redémarrez le backend après modification du `.env`

### Erreur 401 Unauthorized

- Vérifiez que vous envoyez un token JWT valide
- Utilisez `@Public()` decorator si vous voulez un endpoint public

### Emails non reçus

- Vérifiez les logs du backend
- Vérifiez le dashboard useSend
- Vérifiez que le domaine est vérifié dans useSend

## 📚 Documentation complète

- Backend: `apps/backend/EMAIL_MODULE.md`
- useSend: https://ossapps.mintlify.app/get-started/nodejs
- Swagger: http://localhost:8080/api

## ✨ Prochaines étapes

1. Intégrer avec Better Auth pour les flows d'authentification
2. Ajouter des templates supplémentaires selon vos besoins
3. Configurer un système de queue pour les envois en masse
4. Ajouter des tests E2E
5. Personnaliser les designs des templates

Bon développement ! 🎯
