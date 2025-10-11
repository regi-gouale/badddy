import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-[radial-gradient(circle_at_top,_theme(colors.primary/20),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_theme(colors.primary/15),_transparent_60%)]" />
      <header className="relative z-10 border-b border-border/80 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-10 items-center justify-between px-4 lg:px-8">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
