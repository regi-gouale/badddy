"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { IconRestore } from "@tabler/icons-react";

// Schema for email validation
const formSchema = z.object({
  email: z
    .email({ message: "Format d'adresse e-mail invalide" })
    .min(1, "L'adresse e-mail est requise")
    .max(255)
    .refine((email) => z.email().safeParse(email).success, {
      message: "Format d'adresse e-mail invalide",
    }),
});

export function ForgotPasswordForm() {
  const [email, setEmail] = useQueryState("email");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const resultResetPassword = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resultResetPassword.error) {
      toast.error(
        resultResetPassword.error?.message ||
          "Une erreur est survenue. Veuillez réessayer.",
        { duration: 5000 }
      );
    } else {
      toast.success(
        "Un email de réinitialisation de mot de passe a été envoyé si l'adresse existe.",
        { duration: 5000 }
      );
    }
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-[40vh] h-full w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre adresse e-mail pour recevoir un lien de
            réinitialisation du mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="Entrez votre adresse e-mail"
                          type="email"
                          autoComplete="email"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setEmail(e.target.value);
                          }}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Envoyer le lien de réinitialisation
                  <IconRestore className="size-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
