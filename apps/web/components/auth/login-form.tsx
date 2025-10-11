"use client";

import { WithAppleButton } from "@/components/auth/with-apple-button";
import WithGoogleButton from "@/components/auth/with-google-button";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconLogin2,
  IconMailFilled,
  IconPasswordUser,
} from "@tabler/icons-react";
import { usePlausible } from "next-plausible";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  email: z.email({
    message: "Saisissez une adresse e-mail valide.",
  }),
  password: z.string().min(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères.",
  }),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const plausible = usePlausible();

  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    plausible("login");
    setIsConnecting(true);
    const resultUser = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (resultUser.error) {
      toast.error(resultUser.error.message);
      setIsConnecting(false);
      return;
    }

    toast.success("Connexion réussie !");
    router.push("/dashboard");
    setIsConnecting(false);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Heureux de vous revoir</CardTitle>
          <CardDescription>
            Connectez-vous avec votre compte Apple ou Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <Field>
                        <InputGroup>
                          <FormControl>
                            <InputGroupInput
                              id="email"
                              type="email"
                              placeholder="email@example.com"
                              {...field}
                            />
                          </FormControl>
                          <InputGroupAddon>
                            <IconMailFilled className="size-4" />
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                        <Link
                          href="#"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Mot de passe oublié ?
                        </Link>
                      </div>
                      <Field>
                        <InputGroup>
                          <InputGroupInput
                            id="password"
                            type="password"
                            placeholder="Votre mot de passe"
                            {...field}
                          />
                          <InputGroupAddon>
                            <IconPasswordUser className="size-4" />
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Field>
                  <Button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full"
                  >
                    Se connecter
                    {isConnecting ? (
                      <Spinner className="size-4" />
                    ) : (
                      <IconLogin2 className="size-4" />
                    )}
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card uppercase">
                  Ou
                </FieldSeparator>
                <Field>
                  <WithAppleButton label="Se connecter" />
                  <WithGoogleButton label="Se connecter" />
                  <FieldDescription className="text-center">
                    Vous n&apos;avez pas de compte ?{" "}
                    <Link href="/signup" className="font-semibold">
                      Inscrivez-vous
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        En vous connectant, vous acceptez nos{" "}
        <Link href="#">Conditions d&apos;utilisation</Link> et{" "}
        <Link href="#">Politique de confidentialité</Link>.
      </FieldDescription>
    </div>
  );
}
