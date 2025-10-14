import { CreateOrganizationForm } from "@/components/organization/create-organization-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CreateOrganizationPage() {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/login");
  }

  const activeOrganizationId = (
    session.session as { activeOrganizationId?: string | null } | undefined
  )?.activeOrganizationId;

  if (activeOrganizationId) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <CreateOrganizationForm />
    </div>
  );
}
