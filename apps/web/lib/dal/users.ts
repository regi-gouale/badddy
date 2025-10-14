import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import "server-only";

/**
 * Vérifie si l'email d'un utilisateur a été vérifié dans la base de données.
 *
 * @param email - L'adresse email à vérifier (doit être validée avant l'appel)
 * @returns true si l'email est vérifié, false sinon ou en cas d'erreur
 *
 * @example
 * ```ts
 * const verified = await isEmailVerified("user@example.com");
 * if (verified) {
 *   // L'utilisateur peut se connecter
 * }
 * ```
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    return existingUser?.emailVerified ?? false;
  } catch (error) {
    logger.error("Failed to check email verification status", error, {
      component: "DAL.users",
      action: "isEmailVerified",
      emailHash: Buffer.from(email).toString("base64").substring(0, 8),
    });

    // En cas d'erreur DB, retourner false pour forcer la vérification
    // Cela évite de laisser passer un utilisateur non vérifié
    return false;
  }
}
