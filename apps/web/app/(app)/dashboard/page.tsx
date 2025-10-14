import { DashboardApiMonitor } from "@/components/dashboard-api-monitor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getActiveOrganizationId } from "@/types/auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/login");
  }

  // Utilisation du helper type-safe
  const activeOrganizationId = getActiveOrganizationId(session);

  if (!activeOrganizationId) {
    redirect("/dashboard/organization/create");
  }

  const displayName = session.user.name ?? session.user.email ?? "Utilisateur";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Bienvenue, {displayName}
          </CardTitle>
          <CardDescription>
            Accédez aux informations clés de votre organisation active et
            surveillez l&apos;état de vos services en temps réel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ce tableau de bord regroupe les indicateurs essentiels pour suivre
            la santé de votre intégration API.
          </p>
        </CardContent>
      </Card>

      <DashboardApiMonitor />
    </div>
  );
}
