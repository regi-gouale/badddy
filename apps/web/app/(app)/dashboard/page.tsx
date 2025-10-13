import { auth } from "@/lib/auth";
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

  return (
    <div className="space-y-4">
      <div>
        Vous êtes sur le tableau de bord, vous devez être connecté pour voir
        cette page.
      </div>
    </div>
  );
}
