/**
 * Hooks React Query pour l'API Email
 */

"use client";

import {
  emailApi,
  EmailResponse,
  SendEmailRequest,
  SendResetPasswordEmailRequest,
  SendVerificationEmailRequest,
  SendWelcomeEmailRequest,
} from "@/lib/email-api";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Hook pour envoyer un email générique
 */
export function useSendEmail(): UseMutationResult<
  EmailResponse,
  Error,
  SendEmailRequest
> {
  return useMutation({
    mutationFn: emailApi.sendEmail,
    onSuccess: () => {
      toast.success("Email envoyé avec succès");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de l'envoi de l'email : ${error.message}`);
    },
  });
}

/**
 * Hook pour envoyer un email de vérification
 */
export function useSendVerificationEmail(): UseMutationResult<
  EmailResponse,
  Error,
  SendVerificationEmailRequest
> {
  return useMutation({
    mutationFn: emailApi.sendVerificationEmail,
    onSuccess: () => {
      toast.success(
        "Email de vérification envoyé ! Vérifiez votre boîte de réception."
      );
    },
    onError: (error: Error) => {
      toast.error(
        `Erreur lors de l'envoi de l'email de vérification : ${error.message}`
      );
    },
  });
}

/**
 * Hook pour envoyer un email de réinitialisation de mot de passe
 */
export function useSendResetPasswordEmail(): UseMutationResult<
  EmailResponse,
  Error,
  SendResetPasswordEmailRequest
> {
  return useMutation({
    mutationFn: emailApi.sendResetPasswordEmail,
    onSuccess: () => {
      toast.success(
        "Email de réinitialisation envoyé ! Vérifiez votre boîte de réception."
      );
    },
    onError: (error: Error) => {
      toast.error(
        `Erreur lors de l'envoi de l'email de réinitialisation : ${error.message}`
      );
    },
  });
}

/**
 * Hook pour envoyer un email de bienvenue
 */
export function useSendWelcomeEmail(): UseMutationResult<
  EmailResponse,
  Error,
  SendWelcomeEmailRequest
> {
  return useMutation({
    mutationFn: emailApi.sendWelcomeEmail,
    onSuccess: () => {
      toast.success("Email de bienvenue envoyé !");
    },
    onError: (error: Error) => {
      toast.error(
        `Erreur lors de l'envoi de l'email de bienvenue : ${error.message}`
      );
    },
  });
}
