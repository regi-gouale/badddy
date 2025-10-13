/**
 * Client API pour le module Email
 * À utiliser dans apps/web pour communiquer avec le backend
 */

import { backendApiClient } from "./backend-api-client";

/**
 * Types pour les requêtes email
 */
export interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendVerificationEmailRequest {
  to: string;
  userName: string;
  verificationUrl: string;
}

export interface SendResetPasswordEmailRequest {
  to: string;
  userName: string;
  resetUrl: string;
}

export interface SendWelcomeEmailRequest {
  to: string;
  userName: string;
}

/**
 * Réponse standard pour les emails
 */
export interface EmailResponse {
  message: string;
}

/**
 * URL du backend pour les appels directs (sans JWT)
 */
const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8080";

/**
 * Client API Email pour appels depuis le serveur (sans JWT)
 * À utiliser dans les API routes ou Better Auth
 */
export const emailApiServer = {
  /**
   * Envoie un email de vérification d'inscription (côté serveur, sans JWT)
   */
  async sendVerificationEmail(
    data: SendVerificationEmailRequest
  ): Promise<EmailResponse> {
    const response = await fetch(`${BACKEND_URL}/api/v1/email/verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send verification email: ${response.statusText}`
      );
    }

    return response.json();
  },

  /**
   * Envoie un email de réinitialisation de mot de passe (côté serveur, sans JWT)
   */
  async sendResetPasswordEmail(
    data: SendResetPasswordEmailRequest
  ): Promise<EmailResponse> {
    console.log(
      "📧 Envoi email reset-password avec les données:",
      JSON.stringify(data, null, 2)
    );
    console.log("🔗 URL backend:", BACKEND_URL);

    const response = await fetch(`${BACKEND_URL}/api/v1/email/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("📩 Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("❌ Error response body:", errorBody);
      throw new Error(
        `Failed to send reset password email: ${response.statusText}`
      );
    }

    return response.json();
  },
};

/**
 * Client API Email pour appels depuis le client (avec JWT)
 * À utiliser dans les composants React
 */
export const emailApi = {
  /**
   * Envoie un email générique
   */
  async sendEmail(data: SendEmailRequest): Promise<EmailResponse> {
    const response = await backendApiClient.post<EmailResponse>(
      "/email/send",
      data
    );
    return response.data!;
  },

  /**
   * Envoie un email de vérification d'inscription
   */
  async sendVerificationEmail(
    data: SendVerificationEmailRequest
  ): Promise<EmailResponse> {
    const response = await backendApiClient.post<EmailResponse>(
      "/email/verification",
      data
    );
    return response.data!;
  },

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendResetPasswordEmail(
    data: SendResetPasswordEmailRequest
  ): Promise<EmailResponse> {
    const response = await backendApiClient.post<EmailResponse>(
      "/email/reset-password",
      data
    );
    return response.data!;
  },

  /**
   * Envoie un email de bienvenue
   */
  async sendWelcomeEmail(
    data: SendWelcomeEmailRequest
  ): Promise<EmailResponse> {
    const response = await backendApiClient.post<EmailResponse>(
      "/email/welcome",
      data
    );
    return response.data!;
  },
};

/**
 * Hook React Query pour l'envoi d'emails
 * Exemple d'utilisation dans un composant :
 *
 * ```tsx
 * import { useSendVerificationEmail } from '@/lib/email-api';
 *
 * function SignupForm() {
 *   const sendVerification = useSendVerificationEmail();
 *
 *   const handleSubmit = async (email: string, name: string) => {
 *     await sendVerification.mutateAsync({
 *       to: email,
 *       userName: name,
 *       verificationUrl: `${window.location.origin}/verify?token=xxx`
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {sendVerification.isPending && <Spinner />}
 *       {sendVerification.isError && <Error />}
 *     </form>
 *   );
 * }
 * ```
 */
export function useSendVerificationEmail() {
  // Cette fonction sera implémentée avec React Query
  // dans le fichier apps/web/hooks/use-email.ts
  throw new Error(
    "Utilisez le hook depuis apps/web/hooks/use-email.ts après implémentation"
  );
}
