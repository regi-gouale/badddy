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
import { useRouter, useSearchParams } from "next/navigation";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /[A-Z]/,
        "Le mot de passe doit contenir au moins une lettre majuscule"
      )
      .regex(
        /[a-z]/,
        "Le mot de passe doit contenir au moins une lettre minuscule"
      )
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Le mot de passe doit contenir au moins un caractère spécial"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
  });

export default function ResetPasswordPreview() {
  const search = useSearchParams();
  const token = search.get("token");
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  if (token === null || token.trim() === "") {
    return (
      <div className="flex min-h-[50vh] h-full w-full items-center justify-center px-4">
        <Card className="mx-auto max-w-xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">
              Réinitialiser le mot de passe
            </CardTitle>
            <CardDescription>
              Le lien de réinitialisation du mot de passe est invalide ou a
              expiré. Veuillez demander un nouveau lien de réinitialisation.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Assuming an async reset password function
      console.log(values);
      authClient.resetPassword({
        newPassword: values.password,
        token: token ?? undefined,
      });
      form.reset();
      toast.success(
        "Réinitialisation du mot de passe réussie. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
        { duration: 5000 }
      );
      router.push("/login");
    } catch (error) {
      console.error(
        "Erreur lors de la réinitialisation du mot de passe",
        error,
        { duration: 5000 }
      );
      toast.error(
        "Échec de la réinitialisation du mot de passe. Veuillez réessayer.",
        { duration: 5000 }
      );
    }
  }

  return (
    <div className="flex min-h-[50vh] h-full w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            Réinitialiser le mot de passe
          </CardTitle>
          <CardDescription>
            Entrez votre nouveau mot de passe pour réinitialiser votre mot de
            passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                {/* New Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="password">
                        Nouveau mot de passe
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="******"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="confirmPassword">
                        Confirmer le mot de passe
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="******"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Réinitialiser le mot de passe
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
