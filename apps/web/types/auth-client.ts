/**
 * Types étendus pour le client d'authentification Better Auth
 * Centralise les types pour éviter les castings répétitifs
 */

import type { authClient } from "@/lib/auth-client";

export type OrganizationActions = {
  create: (input: { name: string; slug: string }) => Promise<{
    data?: { id?: string };
    error?: { message?: string };
  }>;
  setActive: (input: { organizationId: string }) => Promise<{
    data?: unknown;
    error?: { message?: string };
  }>;
  list: () => Promise<{
    data?: Array<Record<string, unknown>>;
    error?: { message?: string };
  }>;
};

export type AuthClientHelpers = {
  getSession: () => Promise<{
    data?: { user?: { name?: string | null; email?: string | null } };
    error?: { message?: string };
  }>;
};

export type ExtendedAuthClient = typeof authClient &
  AuthClientHelpers & {
    organization: OrganizationActions;
  };

/**
 * Type guard pour vérifier si le client a les capacités d'organisation
 */
export function hasOrganizationSupport(
  client: unknown
): client is ExtendedAuthClient {
  return (
    typeof client === "object" &&
    client !== null &&
    "organization" in client &&
    typeof (client as { organization: unknown }).organization === "object"
  );
}

/**
 * Helper type-safe pour extraire l'ID d'organisation active de la session
 */
export function getActiveOrganizationId(session: unknown): string | null {
  if (
    typeof session === "object" &&
    session !== null &&
    "session" in session &&
    typeof (session as { session: unknown }).session === "object" &&
    (session as { session: unknown }).session !== null
  ) {
    const sessionData = (session as { session: Record<string, unknown> })
      .session;
    if (
      "activeOrganizationId" in sessionData &&
      typeof sessionData.activeOrganizationId === "string"
    ) {
      return sessionData.activeOrganizationId;
    }
  }
  return null;
}
