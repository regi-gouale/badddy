"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SendEmailVerificationButton({ email }: { email: string }) {
  return (
    <Button
      className="w-full bg-primary/75"
      onClick={async () => {
        await authClient.sendVerificationEmail({
          email,
          callbackURL: "/dashboard",
        });
      }}
    >
      Renvoyer le mail de vérification
    </Button>
  );
}
