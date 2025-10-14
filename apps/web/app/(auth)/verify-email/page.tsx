import { SendEmailVerificationButton } from "@/components/auth/send-email-verification-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isEmailVerified } from "@/lib/dal/users";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

type VerifyEmailPageProps = {
  searchParams: Promise<
    Readonly<{
      email?: string;
    }>
  >;
};

/**
 * Valide le format d'une adresse email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { email } = await searchParams;

  const VerificationState = ({
    title,
    description,
    validEmail,
    showResendButton = false,
    footerText,
  }: {
    title: string;
    description: string;
    validEmail?: string;
    showResendButton?: boolean;
    footerText?: string;
  }) => (
    <div className={cn("flex flex-col w-full max-w-md mx-auto")}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardDescription className="px-6">{description}</CardDescription>
        {showResendButton && validEmail && (
          <CardAction className="mx-auto">
            <SendEmailVerificationButton email={validEmail} />
          </CardAction>
        )}
        {footerText && (
          <Button
            variant={"link"}
            className="text-xs text-muted-foreground"
            asChild
          >
            <Link href={"/login"}>{footerText}</Link>
          </Button>
        )}
      </Card>
    </div>
  );

  // Validation 1: Email manquant
  if (!email) {
    logger.warn("Email verification attempted without email parameter", {
      component: "VerifyEmailPage",
    });
    return (
      <VerificationState
        title="Adresse e-mail manquante"
        description="Vous devez fournir une adresse e-mail pour continuer la validation."
        footerText="Retour à la page de connexion"
      />
    );
  }

  // Validation 2: Format email invalide (sécurité XSS)
  if (!isValidEmail(email)) {
    logger.warn("Invalid email format in verification page", {
      component: "VerifyEmailPage",
      emailLength: email.length,
    });
    return (
      <VerificationState
        title="Adresse e-mail invalide"
        description="L'adresse e-mail fournie n'est pas valide. Veuillez vérifier le format."
        footerText="Retour à la page de connexion"
      />
    );
  }

  // À ce stade, email est validé et safe
  const validEmail: string = email;

  try {
    const isVerified = await isEmailVerified(validEmail);

    if (!isVerified) {
      return (
        <VerificationState
          title="Vérification en attente"
          description="Un lien de vérification a été envoyé à votre adresse e-mail. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour confirmer votre compte."
          validEmail={validEmail}
          showResendButton={true}
          footerText="Retour à la page de connexion"
        />
      );
    }

    // Email vérifié, rediriger vers login
    redirect("/login");
  } catch (error) {
    logger.error("Failed to check email verification status", error, {
      component: "VerifyEmailPage",
      action: "isEmailVerified",
    });

    return (
      <VerificationState
        title="Erreur de vérification"
        description="Une erreur est survenue lors de la vérification de votre e-mail. Veuillez réessayer dans quelques instants."
        footerText="Retour à la page de connexion"
      />
    );
  }
}
