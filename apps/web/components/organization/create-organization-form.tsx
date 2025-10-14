"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconBuildingStore } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
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
import { toast } from "sonner";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères." })
    .max(64, { message: "Le nom ne peut pas dépasser 64 caractères." })
    .trim(),
});

type FormValues = z.infer<typeof formSchema>;

const normalizeSlugBase = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const DIGIT_SUFFIX_LENGTH = 4;
const generateSlug = (value: string) => {
  const baseCandidate = normalizeSlugBase(value) || "organisation";
  const maxBaseLength = 50 - (DIGIT_SUFFIX_LENGTH + 1); // hyphen + digits
  const truncatedBase = baseCandidate.slice(0, Math.max(1, maxBaseLength));
  const digits = Math.floor(Math.random() * 10 ** DIGIT_SUFFIX_LENGTH)
    .toString()
    .padStart(DIGIT_SUFFIX_LENGTH, "0");
  return `${truncatedBase}-${digits}`;
};

type OrganizationActions = {
  create: (input: { name: string; slug: string }) => Promise<{
    data?: { id?: string };
    error?: { message?: string };
  }>; // client-side create helper
  setActive?: (input: { organizationId: string }) => Promise<unknown>;
  list?: () => Promise<{
    data?: Array<Record<string, unknown>>;
    error?: { message?: string };
  }>;
};

type AuthClientWithHelpers = typeof authClient & {
  getSession?: () => Promise<{
    data?: { user?: { name?: string | null } };
    error?: { message?: string };
  }>;
};

export function CreateOrganizationForm({ className }: { className?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    let cancelled = false;

    const initializeDefaults = async () => {
      try {
        const authHelpers = authClient as AuthClientWithHelpers;
        const organizationClient = (
          authClient as unknown as { organization?: OrganizationActions }
        ).organization;

        const [sessionResult, organizationsResult] = await Promise.all([
          authHelpers.getSession?.(),
          organizationClient?.list ? organizationClient.list() : undefined,
        ]);

        if (cancelled) {
          return;
        }

        const organizations = Array.isArray(organizationsResult?.data)
          ? organizationsResult?.data
          : [];

        if (organizations.length > 0) {
          return;
        }

        const suggestedName = sessionResult?.data?.user?.name?.trim();
        if (!suggestedName) {
          return;
        }

        const fieldState = form.getFieldState("name");
        if (fieldState.isDirty || fieldState.isTouched) {
          return;
        }

        form.reset({ name: suggestedName });
      } catch (error) {
        console.error("organization:create:defaults", error);
      }
    };

    initializeDefaults();

    return () => {
      cancelled = true;
    };
  }, [form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const organizationClient = (
        authClient as unknown as { organization?: OrganizationActions }
      ).organization;

      if (!organizationClient?.create) {
        toast.error(
          "La gestion des organisations est temporairement indisponible."
        );
        return;
      }

      const payload = {
        name: values.name.trim(),
        slug: generateSlug(values.name),
      };

      const response = await organizationClient.create(payload);

      if (response.error) {
        toast.error(
          response.error.message ?? "Impossible de créer l'organisation."
        );
        return;
      }

      const organizationId = response.data?.id;

      if (organizationId && organizationClient?.setActive) {
        await organizationClient.setActive({ organizationId });
      }

      toast.success("Organisation créée avec succès.");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Créez votre organisation</CardTitle>
        <CardDescription>
          Configurez votre premier espace de travail pour débloquer le tableau
          de bord.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l&apos;organisation</FormLabel>
                    <Field>
                      <InputGroup>
                        <FormControl>
                          <InputGroupInput
                            {...field}
                            placeholder="Ex: Acme Corp"
                          />
                        </FormControl>
                        <InputGroupAddon>
                          <IconBuildingStore className="size-4" />
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                    <FieldDescription>
                      Le slug sera généré automatiquement à partir de ce nom.
                    </FieldDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Créer l&apos;organisation
                  {isSubmitting ? <Spinner className="ml-2 size-4" /> : null}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
