# Module Email - Documentation

## 📧 Vue d'ensemble

Le module Email permet d'envoyer des emails via **useSend** dans l'application Badddy. Il fournit des templates HTML prédéfinis et des endpoints REST pour différents types d'emails.

## 🔧 Configuration

### Variables d'environnement

Ajoutez la clé API useSend dans votre fichier `.env` :

```env
USESEND_APIKEY=us_xxxxxxxxxxxxx
```

### Expéditeur par défaut

Tous les emails sont envoyés depuis : **No Reply Badddy <noreply@cotizoo.com>**

## 📡 Endpoints disponibles

Tous les endpoints sont préfixés par `/api/v1/email` et **nécessitent une authentification JWT**.

### 1. Envoi d'email générique

**Endpoint:** `POST /api/v1/email/send`

**Description:** Permet d'envoyer un email personnalisé avec du HTML brut.

**Body:**

```json
{
  "to": "destinataire@example.com",
  "subject": "Sujet de l'email",
  "html": "<h1>Contenu HTML</h1><p>Votre message ici</p>",
  "text": "Version texte optionnelle"
}
```

**Réponse:**

```json
{
  "message": "Email envoyé avec succès"
}
```

### 2. Email de vérification

**Endpoint:** `POST /api/v1/email/verification`

**Description:** Envoie un email de vérification d'inscription avec un lien d'activation.

**Body:**

```json
{
  "to": "user@example.com",
  "userName": "Jean Dupont",
  "verificationUrl": "https://app.badddy.com/verify?token=abc123"
}
```

**Template inclus:**

- Design moderne et responsive
- Bouton d'action clair
- Avertissement d'expiration (24h)
- Lien de secours

### 3. Email de réinitialisation de mot de passe

**Endpoint:** `POST /api/v1/email/reset-password`

**Description:** Envoie un email pour réinitialiser le mot de passe.

**Body:**

```json
{
  "to": "user@example.com",
  "userName": "Jean Dupont",
  "resetUrl": "https://app.badddy.com/reset-password?token=xyz789"
}
```

**Template inclus:**

- Design sécurisé (couleur rouge pour la sécurité)
- Avertissement d'expiration (1h)
- Message de sécurité si ce n'est pas l'utilisateur

### 4. Email de bienvenue

**Endpoint:** `POST /api/v1/email/welcome`

**Description:** Envoie un email de bienvenue après activation du compte.

**Body:**

```json
{
  "to": "user@example.com",
  "userName": "Jean Dupont"
}
```

**Template inclus:**

- Message de bienvenue chaleureux
- Liste des fonctionnalités disponibles
- Bouton vers le dashboard

## 🎨 Templates disponibles

Les templates sont définis dans `src/modules/email/templates/email.templates.ts` :

1. **`EmailTemplates.verification(userName, verificationUrl)`**
   - Email de confirmation d'inscription
   - Couleur principale : Indigo (#4F46E5)

2. **`EmailTemplates.resetPassword(userName, resetUrl)`**
   - Email de réinitialisation de mot de passe
   - Couleur principale : Rouge (#DC2626)

3. **`EmailTemplates.welcome(userName)`**
   - Email de bienvenue
   - Liste des fonctionnalités

4. **`EmailTemplates.notification(userName, title, message)`**
   - Template générique pour notifications

## 💻 Utilisation dans le code

### Injection du service

```typescript
import { EmailService } from './modules/email';

@Injectable()
export class MonService {
  constructor(private readonly emailService: EmailService) {}

  async envoyerEmail() {
    await this.emailService.sendVerificationEmail(
      'user@example.com',
      'Jean Dupont',
      'https://app.badddy.com/verify?token=abc123',
    );
  }
}
```

### Méthodes disponibles

```typescript
// Email générique
await emailService.sendEmail(to, subject, html, text?);

// Email de vérification
await emailService.sendVerificationEmail(to, userName, verificationUrl);

// Email de réinitialisation
await emailService.sendResetPasswordEmail(to, userName, resetUrl);

// Email de bienvenue
await emailService.sendWelcomeEmail(to, userName);

// Notification générique
await emailService.sendNotification(to, userName, title, message);
```

## 🔐 Sécurité

- ✅ Tous les endpoints nécessitent une authentification JWT
- ✅ Rate limiting global (10 requêtes/minute)
- ✅ Validation des données avec class-validator
- ✅ Logs détaillés des envois
- ✅ Gestion des erreurs

## 🧪 Tests

Pour tester l'envoi d'emails en local :

```bash
# Démarrer le backend
pnpm --filter backend dev

# Utiliser curl ou un client HTTP
curl -X POST http://localhost:8080/api/v1/email/welcome \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "to": "test@example.com",
    "userName": "Test User"
  }'
```

## 📝 Exemple d'intégration Frontend

### Dans Next.js (apps/web)

```typescript
// lib/email-api.ts
import { backendApi } from './backend-api-client';

export async function sendVerificationEmail(
  email: string,
  userName: string,
  verificationUrl: string,
) {
  const response = await backendApi.post('/email/verification', {
    to: email,
    userName,
    verificationUrl,
  });
  return response.data;
}

export async function sendWelcomeEmail(email: string, userName: string) {
  const response = await backendApi.post('/email/welcome', {
    to: email,
    userName,
  });
  return response.data;
}
```

### Dans un composant de signup

```typescript
// components/auth/signup-form.tsx
import { sendVerificationEmail } from '@/lib/email-api';

async function handleSignup(email: string, password: string) {
  // 1. Créer l'utilisateur
  const user = await createUser(email, password);

  // 2. Envoyer l'email de vérification
  const verificationUrl = `${window.location.origin}/verify?token=${user.verificationToken}`;
  await sendVerificationEmail(email, user.name, verificationUrl);

  // 3. Afficher un message de confirmation
  toast.success('Email de vérification envoyé !');
}
```

## 🚨 Gestion des erreurs

Le service logue toutes les erreurs et les propage. Assurez-vous de gérer les erreurs dans votre code :

```typescript
try {
  await emailService.sendVerificationEmail(to, userName, url);
} catch (error) {
  logger.error("Erreur lors de l'envoi de l'email", error);
  throw new HttpException(
    "Impossible d'envoyer l'email",
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
```

## 📊 Swagger Documentation

Accédez à la documentation interactive Swagger :

```
http://localhost:8080/api
```

Tous les endpoints Email sont documentés avec leurs schémas de validation.

## 🔄 Évolutions futures

- [ ] Support des pièces jointes
- [ ] Templates React Email
- [ ] File d'attente avec Bull
- [ ] Tracking des emails (ouvertures, clics)
- [ ] Support multilingue des templates
- [ ] Prévisualisation des emails en dev

## 📚 Ressources

- [Documentation useSend](https://ossapps.mintlify.app/get-started/nodejs)
- [Dashboard useSend](https://app.usesend.com)
- [Swagger API](http://localhost:8080/api)
