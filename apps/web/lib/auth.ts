import { PrismaClient } from "@/generated/prisma";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt, organization, twoFactor } from "better-auth/plugins";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripePlugin =
  stripeSecretKey && stripeWebhookSecret
    ? stripe({
        stripeClient: new Stripe(stripeSecretKey, {
          apiVersion: "2025-08-27.basil",
        }),
        stripeWebhookSecret,
        createCustomerOnSignUp: true,
      })
    : null;
export const auth: ReturnType<typeof betterAuth> = betterAuth({
  appName: "Badddy",
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenLength: 48,
    verifyEmailTokenLength: 48,
    emailVerificationTokenExpiresIn: 1000 * 60 * 60 * 24, // 24 hours
    resetPasswordTokenExpiresIn: 1000 * 60 * 15, // 15 minutes
    sendResetPassword: async (email, token) => {
      // Envoyer l'email de réinitialisation du mot de passe
      console.log(
        `Envoyer un email de réinitialisation du mot de passe à ${email} avec le token : ${token}`
      );
    },
  },
  plugins: [
    twoFactor(),
    organization(),
    jwt(),
    ...(stripePlugin ? [stripePlugin] : []),
  ],
});
