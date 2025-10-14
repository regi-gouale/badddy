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
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import type { ExtendedAuthClient } from "@/types/auth-client";
import { hasOrganizationSupport } from "@/types/auth-client";
import { toast } from "sonner";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères." })
    .max(64, { message: "Le nom ne peut pas dépasser 64 caractères." })
    .trim(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Normalise une chaîne pour créer un slug URL-safe
 */
const normalizeSlugBase = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const DIGIT_SUFFIX_LENGTH = 4;

/**
 * Génère un slug unique à partir d'un nom
 * Note: En production, la génération devrait être déléguée au backend
 * pour garantir l'unicité via vérification DB
 */
const generateSlug = (value: string) => {
  const baseCandidate = normalizeSlugBase(value) || "organisation";
  const maxBaseLength = 50 - (DIGIT_SUFFIX_LENGTH + 1); // hyphen + digits
  const truncatedBase = baseCandidate.slice(0, Math.max(1, maxBaseLength));
  const digits = Math.floor(Math.random() * 10 ** DIGIT_SUFFIX_LENGTH)
    .toString()
    .padStart(DIGIT_SUFFIX_LENGTH, "0");
  return `${truncatedBase}-${digits}`;
};

export function CreateOrganizationForm({ className }: { className?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

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
        if (!hasOrganizationSupport(authClient)) {
          logger.warn("Organization support not available", {
            component: "CreateOrganizationForm",
            action: "initializeDefaults",
          });
          return;
        }

        const client = authClient as ExtendedAuthClient;

        const [sessionResult, organizationsResult] = await Promise.all([
          client.getSession(),
          client.organization.list(),
        ]);

        if (cancelled) {
          return;
        }

        const organizations = Array.isArray(organizationsResult?.data)
          ? organizationsResult.data
          : [];

        // Si l'utilisateur a déjà des organisations, ne pas pré-remplir
        if (organizations.length > 0) {
          return;
        }

        const suggestedName = sessionResult?.data?.user?.name?.trim();
        if (!suggestedName) {
          return;
        }

        // Vérifier que le champ n'a pas été modifié par l'utilisateur
        const currentValue = form.getValues("name");
        if (!currentValue) {
          form.setValue("name", suggestedName, { shouldDirty: false });
        }
      } catch (error) {
        logger.error("Failed to initialize organization form defaults", error, {
          component: "CreateOrganizationForm",
          action: "initializeDefaults",
        });
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    initializeDefaults();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Exécuter une seule fois au montage

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (!hasOrganizationSupport(authClient)) {
        toast.error(
          "La gestion des organisations est temporairement indisponible."
        );
        logger.error(
          "Organization support not available during form submission",
          undefined,
          {
            component: "CreateOrganizationForm",
            action: "onSubmit",
          }
        );
        return;
      }

      const client = authClient as ExtendedAuthClient;

      const payload = {
        name: values.name.trim(),
        slug: generateSlug(values.name),
      };

      logger.debug("Creating organization", {
        component: "CreateOrganizationForm",
        action: "create",
        organizationName: payload.name,
      });

      const response = await client.organization.create(payload);

      if (response.error) {
        const errorMessage =
          response.error.message ?? "Impossible de créer l'organisation.";
        toast.error(errorMessage);
        logger.error("Failed to create organization", response.error, {
          component: "CreateOrganizationForm",
          action: "create",
        });
        return;
      }

      const organizationId = response.data?.id;

      if (organizationId) {
        await client.organization.setActive({ organizationId });
        logger.info("Organization created and set as active", {
          component: "CreateOrganizationForm",
          organizationId,
        });
      }

      toast.success("Organisation créée avec succès.");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      logger.error("Unexpected error during organization creation", error, {
        component: "CreateOrganizationForm",
        action: "onSubmit",
      });
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // État de chargement pendant l'initialisation
  if (isInitializing) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center p-8">
          <Spinner className="size-6" />
          <span className="ml-2 text-sm text-muted-foreground">
            Chargement...
          </span>
        </CardContent>
      </Card>
    );
  }

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
