/**
 * Exemple de composant pour envoyer un email de vérification
 * Ce fichier peut être copié et adapté selon vos besoins
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSendVerificationEmail } from "@/hooks/use-email";
import { Mail } from "lucide-react";

interface VerificationEmailButtonProps {
  userEmail: string;
  userName: string;
  verificationToken: string;
}

/**
 * Bouton pour renvoyer un email de vérification
 */
export function VerificationEmailButton({
  userEmail,
  userName,
  verificationToken,
}: VerificationEmailButtonProps) {
  const sendVerification = useSendVerificationEmail();

  const handleSendEmail = () => {
    const verificationUrl = `${window.location.origin}/verify?token=${verificationToken}`;

    sendVerification.mutate({
      to: userEmail,
      userName,
      verificationUrl,
    });
  };

  return (
    <Button
      onClick={handleSendEmail}
      disabled={sendVerification.isPending}
      variant="outline"
      size="sm"
    >
      <Mail className="mr-2 h-4 w-4" />
      {sendVerification.isPending
        ? "Envoi en cours..."
        : "Renvoyer l'email de vérification"}
    </Button>
  );
}

/**
 * Carte d'exemple pour le dashboard
 */
export function EmailVerificationCard() {
  const sendVerification = useSendVerificationEmail();

  const handleResend = () => {
    // Récupérer les infos de l'utilisateur depuis le contexte auth
    // Exemple fictif :
    sendVerification.mutate({
      to: "user@example.com",
      userName: "John Doe",
      verificationUrl: `${window.location.origin}/verify?token=abc123`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compte non vérifié</CardTitle>
        <CardDescription>
          Vérifiez votre email pour activer toutes les fonctionnalités
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Un email de vérification a été envoyé à votre adresse. Si vous ne
          l&apos;avez pas reçu, vous pouvez le renvoyer.
        </p>
        <Button
          onClick={handleResend}
          disabled={sendVerification.isPending}
          className="w-full"
        >
          <Mail className="mr-2 h-4 w-4" />
          {sendVerification.isPending
            ? "Envoi en cours..."
            : "Renvoyer l'email"}
        </Button>
      </CardContent>
    </Card>
  );
}
