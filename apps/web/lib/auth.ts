import { PrismaClient } from "@/generated/prisma";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt, organization, twoFactor } from "better-auth/plugins";
import Stripe from "stripe";
import { emailApiServer } from "./email-api";

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
    sendResetPassword: async ({ user, token }) => {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
      console.log(`🔗 Reset URL: ${resetUrl}`);

      await emailApiServer.sendResetPasswordEmail({
        to: user.email!,
        userName: user.name || "Utilisateur",
        resetUrl,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await emailApiServer.sendVerificationEmail({
        to: user.email!,
        userName: user.name || "Utilisateur",
        verificationUrl: url,
      });
    },
  },
  plugins: [
    organization(),
    twoFactor(),
    jwt(),
    ...(stripePlugin ? [stripePlugin] : []),
  ],
  trustedOrigins: process.env.NEXT_PUBLIC_BASE_URL
    ? [process.env.NEXT_PUBLIC_BASE_URL]
    : ["http://localhost:3000"],
});
