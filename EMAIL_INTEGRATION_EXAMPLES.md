/\*\*

- Exemples d'intégration du module Email
- Ces exemples montrent comment utiliser le service d'email dans différents contextes
  \*/

// ============================================================================
// EXEMPLE 1: Intégration avec Better Auth - Inscription
// ============================================================================

/\*\*

- Backend: Route d'inscription qui envoie un email de vérification
- apps/backend/src/controllers/auth.controller.ts
  \*/
  import { Controller, Post, Body } from '@nestjs/common';
  import { EmailService } from '../modules/email';

@Controller('auth')
export class AuthController {
constructor(private readonly emailService: EmailService) {}

@Post('signup')
async signup(@Body() signupDto: { email: string; password: string; name: string }) {
// 1. Créer l'utilisateur (pseudo-code)
const user = await this.createUser(signupDto);

    // 2. Générer un token de vérification
    const verificationToken = this.generateVerificationToken(user.id);

    // 3. Envoyer l'email de vérification
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
    await this.emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationUrl
    );

    return {
      message: 'Inscription réussie. Vérifiez votre email.',
      userId: user.id
    };

}
}

// ============================================================================
// EXEMPLE 2: Frontend - Formulaire d'inscription
// ============================================================================

/\*\*

- Frontend: Composant de signup
- apps/web/components/auth/register-form.tsx
  \*/
  'use client';

import { useState } from 'react';
import { useSendVerificationEmail } from '@/hooks/use-email';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SignupForm() {
const [email, setEmail] = useState('');
const [name, setName] = useState('');
const [password, setPassword] = useState('');
const sendVerification = useSendVerificationEmail();

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

    try {
      // 1. Créer le compte via Better Auth
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });

      const { verificationToken } = await response.json();

      // 2. Envoyer l'email de vérification
      await sendVerification.mutateAsync({
        to: email,
        userName: name,
        verificationUrl: `${window.location.origin}/verify?token=${verificationToken}`
      });

      // 3. Rediriger vers une page de confirmation
      window.location.href = '/check-email';

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    }

};

return (
<form onSubmit={handleSubmit} className="space-y-4">
<Input
type="text"
placeholder="Nom"
value={name}
onChange={(e) => setName(e.target.value)}
required
/>
<Input
type="email"
placeholder="Email"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
/>
<Input
type="password"
placeholder="Mot de passe"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
/>
<Button 
        type="submit" 
        disabled={sendVerification.isPending}
        className="w-full"
      >
{sendVerification.isPending ? 'Envoi en cours...' : 'S\'inscrire'}
</Button>
</form>
);
}

// ============================================================================
// EXEMPLE 3: Dashboard - Renvoyer email de vérification
// ============================================================================

/\*\*

- Frontend: Composant dans le dashboard
- apps/web/app/(app)/dashboard/components/verify-email-banner.tsx
  \*/
  'use client';

import { useSendVerificationEmail } from '@/hooks/use-email';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, AlertCircle } from 'lucide-react';

interface VerifyEmailBannerProps {
userEmail: string;
userName: string;
isVerified: boolean;
}

export function VerifyEmailBanner({ userEmail, userName, isVerified }: VerifyEmailBannerProps) {
const sendVerification = useSendVerificationEmail();

if (isVerified) return null;

const handleResend = async () => {
// Appeler le backend pour générer un nouveau token
const response = await fetch('/api/auth/resend-verification', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email: userEmail })
});

    const { verificationToken } = await response.json();

    // Envoyer l'email
    await sendVerification.mutateAsync({
      to: userEmail,
      userName,
      verificationUrl: `${window.location.origin}/verify?token=${verificationToken}`
    });

};

return (
<Alert className="mb-4">
<AlertCircle className="h-4 w-4" />
<AlertTitle>Email non vérifié</AlertTitle>
<AlertDescription className="flex items-center justify-between">
<span>
Vérifiez votre email pour activer toutes les fonctionnalités
</span>
<Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={sendVerification.isPending}
        >
<Mail className="mr-2 h-4 w-4" />
{sendVerification.isPending ? 'Envoi...' : 'Renvoyer'}
</Button>
</AlertDescription>
</Alert>
);
}

// ============================================================================
// EXEMPLE 4: Réinitialisation de mot de passe
// ============================================================================

/\*\*

- Backend: Endpoint de réinitialisation
- apps/backend/src/controllers/auth.controller.ts
  \*/
  @Controller('auth')
  export class AuthController {
  constructor(private readonly emailService: EmailService) {}

@Post('forgot-password')
@Public() // Endpoint public
async forgotPassword(@Body() dto: { email: string }) {
// 1. Vérifier que l'utilisateur existe
const user = await this.findUserByEmail(dto.email);

    if (!user) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return { message: 'Si cet email existe, vous recevrez un lien de réinitialisation.' };
    }

    // 2. Générer un token de réinitialisation (expire dans 1h)
    const resetToken = this.generateResetToken(user.id);

    // 3. Envoyer l'email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.emailService.sendResetPasswordEmail(
      user.email,
      user.name,
      resetUrl
    );

    return {
      message: 'Si cet email existe, vous recevrez un lien de réinitialisation.'
    };

}
}

/\*\*

- Frontend: Page de réinitialisation
- apps/web/app/(auth)/forgot-password/page.tsx
  \*/
  'use client';

import { useState } from 'react';
import { useSendResetPasswordEmail } from '@/hooks/use-email';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
const [email, setEmail] = useState('');
const [submitted, setSubmitted] = useState(false);
const sendReset = useSendResetPasswordEmail();

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

    // Appeler le backend
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (response.ok) {
      setSubmitted(true);
    }

};

if (submitted) {
return (
<Card>
<CardHeader>
<CardTitle>Email envoyé</CardTitle>
<CardDescription>
Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.
</CardDescription>
</CardHeader>
</Card>
);
}

return (
<Card>
<CardHeader>
<CardTitle>Mot de passe oublié</CardTitle>
<CardDescription>
Entrez votre email pour recevoir un lien de réinitialisation
</CardDescription>
</CardHeader>
<CardContent>
<form onSubmit={handleSubmit} className="space-y-4">
<Input
type="email"
placeholder="votre@email.com"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
/>
<Button 
            type="submit" 
            disabled={sendReset.isPending}
            className="w-full"
          >
{sendReset.isPending ? 'Envoi...' : 'Envoyer le lien'}
</Button>
</form>
</CardContent>
</Card>
);
}

// ============================================================================
// EXEMPLE 5: Email de bienvenue après vérification
// ============================================================================

/\*\*

- Backend: Route de vérification
- apps/backend/src/controllers/auth.controller.ts
  \*/
  @Controller('auth')
  export class AuthController {
  constructor(private readonly emailService: EmailService) {}

@Post('verify')
@Public()
async verifyEmail(@Body() dto: { token: string }) {
// 1. Valider le token
const userId = this.validateVerificationToken(dto.token);

    if (!userId) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    // 2. Marquer l'utilisateur comme vérifié
    const user = await this.markAsVerified(userId);

    // 3. Envoyer l'email de bienvenue
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return {
      message: 'Email vérifié avec succès',
      user: { id: user.id, email: user.email, name: user.name }
    };

}
}

/\*\*

- Frontend: Page de vérification
- apps/web/app/(auth)/verify/page.tsx
  \*/
  'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyPage() {
const searchParams = useSearchParams();
const token = searchParams.get('token');
const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

useEffect(() => {
const verify = async () => {
try {
const response = await fetch('/api/auth/verify', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ token })
});

        if (response.ok) {
          setStatus('success');
          // Rediriger vers le dashboard après 3 secondes
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 3000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    if (token) {
      verify();
    }

}, [token]);

return (
<div className="flex items-center justify-center min-h-screen">
<Card className="w-full max-w-md">
<CardHeader>
<CardTitle className="flex items-center gap-2">
{status === 'loading' && 'Vérification en cours...'}
{status === 'success' && (
<>
<CheckCircle className="text-green-500" />
Email vérifié !
</>
)}
{status === 'error' && (
<>
<XCircle className="text-red-500" />
Erreur de vérification
</>
)}
</CardTitle>
<CardDescription>
{status === 'success' && 'Votre compte est maintenant actif. Un email de bienvenue vous a été envoyé.'}
{status === 'error' && 'Le lien de vérification est invalide ou a expiré.'}
</CardDescription>
</CardHeader>
</Card>
</div>
);
}

// ============================================================================
// EXEMPLE 6: Utilisation directe du service dans le backend
// ============================================================================

/\*\*

- Backend: Service métier qui utilise EmailService
- apps/backend/src/services/user.service.ts
  \*/
  import { Injectable } from '@nestjs/common';
  import { EmailService } from '../modules/email';

@Injectable()
export class UserService {
constructor(private readonly emailService: EmailService) {}

async createUser(data: CreateUserDto) {
// Créer l'utilisateur
const user = await this.usersRepository.create(data);

    // Envoyer l'email de vérification automatiquement
    const token = this.generateToken(user.id);
    const url = `${process.env.FRONTEND_URL}/verify?token=${token}`;

    await this.emailService.sendVerificationEmail(
      user.email,
      user.name,
      url
    );

    return user;

}

async onUserVerified(userId: string) {
const user = await this.usersRepository.findById(userId);

    // Envoyer l'email de bienvenue
    await this.emailService.sendWelcomeEmail(user.email, user.name);

}
}
