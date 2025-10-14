"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconLogin2,
  IconMailFilled,
  IconPasswordUser,
  IconUserFilled,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";
import { WithAppleButton } from "./with-apple-button";
import WithGoogleButton from "./with-google-button";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Le nom doit contenir au moins 2 caractères.",
    }),
    email: z.email({
      message: "Saisissez une adresse e-mail valide.",
    }),
    password: z.string().min(8, {
      message: "Le mot de passe doit contenir au moins 8 caractères.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Le mot de passe doit contenir au moins 8 caractères.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
  });

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // create user account with better auth
    const resultUser = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (resultUser.error) {
      toast.error("Erreur lors de l'inscription : " + resultUser.error.message);
      setIsLoading(false);
      return;
    }
    toast.success(
      "Inscription réussie ! Un e-mail de confirmation a été envoyé."
    );
    form.reset();

    router.push("/verify-email?email=" + encodeURIComponent(data.email));
    setIsLoading(false);
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bienvenue à bord !</CardTitle>
          <CardDescription>
            Créez un compte en utilisant Apple, Google ou votre e-mail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel htmlFor="name">Nom & Prénom</FieldLabel>
                      <Field>
                        <FormControl>
                          <InputGroup>
                            <InputGroupInput
                              id="name"
                              type="text"
                              placeholder="Votre nom"
                              {...field}
                              disabled={isLoading}
                            />
                            <InputGroupAddon>
                              <IconUserFilled className="size-4" />
                            </InputGroupAddon>
                          </InputGroup>
                        </FormControl>
                      </Field>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Field>
                        <FormControl>
                          <InputGroup>
                            <InputGroupInput
                              id="email"
                              type="email"
                              placeholder="email@example.com"
                              {...field}
                              disabled={isLoading}
                            />
                            <InputGroupAddon>
                              <IconMailFilled className="size-4" />
                            </InputGroupAddon>
                          </InputGroup>
                        </FormControl>
                        <FormDescription>
                          Nous l&apos;utiliserons pour vous contacter. Nous ne
                          partagerons pas votre e-mail avec qui que ce soit
                          d&apos;autre.
                        </FormDescription>
                      </Field>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Field className="grid md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="password">Mot de passe</FormLabel>
                        <Field className="flex items-center justify-between">
                          <FormControl>
                            <InputGroup>
                              <InputGroupInput
                                id="password"
                                type="password"
                                placeholder="Votre mot de passe"
                                {...field}
                                disabled={isLoading}
                              />
                              <InputGroupAddon>
                                <IconPasswordUser className="size-4" />
                              </InputGroupAddon>
                            </InputGroup>
                          </FormControl>
                        </Field>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="confirm-password">
                          Confirmer le mot de passe
                        </FormLabel>
                        <Field className="flex items-center justify-between">
                          <FormControl>
                            <InputGroup>
                              <InputGroupInput
                                id="confirm-password"
                                type="password"
                                placeholder="Votre mot de passe"
                                {...field}
                                disabled={isLoading}
                              />
                              <InputGroupAddon>
                                <IconPasswordUser className="size-4" />
                              </InputGroupAddon>
                            </InputGroup>
                          </FormControl>
                        </Field>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>

                <Field>
                  <Button type="submit" disabled={isLoading}>
                    Créer un compte
                    {isLoading ? (
                      <Spinner className="size-4" />
                    ) : (
                      <IconLogin2 className="size-4" />
                    )}
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card uppercase">
                  ou
                </FieldSeparator>
                <Field className="grid md:grid-cols-2 gap-4">
                  <WithAppleButton label="S'inscrire" isLogin={false} />
                  <WithGoogleButton label="S'inscrire" isLogin={false} />
                </Field>
                <FieldDescription className="text-center">
                  Vous avez déjà un compte ?{" "}
                  <Link href="/login" className="font-semibold">
                    Connectez-vous
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        En vous inscrivant, vous acceptez nos{" "}
        <Link href="#">Conditions d&apos;utilisation</Link> et{" "}
        <Link href="#">Politique de confidentialité</Link>.
      </FieldDescription>
    </div>
  );
}
