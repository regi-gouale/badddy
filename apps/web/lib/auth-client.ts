import { stripeClient } from "@better-auth/stripe/client";
import { createAuthClient } from "better-auth/client";
import {
  jwtClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    appName: "Badddy",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8080",
    plugins: [
      twoFactorClient(),
      organizationClient(),
      jwtClient(),
      stripeClient({
        subscription: true, //if you want to enable subscription management
      }),
    ],
  }
);
