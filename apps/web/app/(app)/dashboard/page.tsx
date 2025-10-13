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

  type GetToken = (args: { headers: Headers }) => Promise<{ token?: string }>;
  const getToken = (auth.api as unknown as { getToken: GetToken }).getToken;

  const tokenResponse = await getToken({
    headers: requestHeaders,
  });

  const jwtToken = tokenResponse?.token ?? null;

  return (
    <div className="space-y-4">
      <div>
        Vous êtes sur le tableau de bord, vous devez être connecté pour voir
        cette page.
      </div>
      <div>
        <h2 className="text-lg font-semibold">Jeton JWT</h2>
        <pre className="whitespace-pre-wrap break-all rounded-md bg-muted p-4 text-sm">
          {jwtToken ?? "Aucun jeton disponible."}
        </pre>
      </div>
    </div>
  );
}
