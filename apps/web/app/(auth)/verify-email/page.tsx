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

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { email } = await searchParams;
  const VerificationState = ({
    title,
    description,
    skipButton,
    footerText,
  }: {
    title: string;
    description: string;
    skipButton?: boolean;
    footerText?: string;
  }) => (
    <div className={cn("flex flex-col w-full max-w-md mx-auto")}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardDescription className="px-6">{description}</CardDescription>
        {skipButton && (
          <CardAction className="mx-auto">
            <SendEmailVerificationButton email={email!} />
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

  if (!email) {
    return (
      <VerificationState
        title="Adresse e-mail manquante"
        description="Vous devez fournir une adresse e-mail pour continuer la validation."
      />
    );
  }

  const isVerified = await isEmailVerified(email);

  if (!isVerified) {
    return (
      <VerificationState
        title="Vérification en attente"
        description={`Un lien de vérification a été envoyé à l'adresse email : ${email}. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour vérifier votre adresse e-mail.`}
        skipButton={true}
        footerText="Retour à la page de connexion"
      />
    );
  }

  redirect("/login");
}
