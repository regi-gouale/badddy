import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return (
      <div className="size-full flex flex-1 items-center justify-center p-4 min-h-screen">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          </CardHeader>
          <CardDescription className="mb-4 p-8 text-center">
            <p>You must be logged in to view this page.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardDescription>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen size-full flex flex-1 items-center p-4">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r">
          <nav className="p-4">{/* Add navigation items here */}</nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
