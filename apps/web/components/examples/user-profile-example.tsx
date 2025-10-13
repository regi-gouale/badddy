"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/hooks/use-backend-api";
import { useEffect } from "react";

/**
 * Exemple de composant qui appelle le backend NestJS avec authentification
 *
 * Ce composant démontre :
 * - L'utilisation du hook `useCurrentUser` pour récupérer les données utilisateur
 * - La gestion automatique de l'authentification via JWT
 * - Les états de chargement et d'erreur
 *
 * Utilisation dans une page :
 * ```tsx
 * import { UserProfileExample } from '@/components/examples/user-profile-example';
 *
 * export default function DashboardPage() {
 *   return <UserProfileExample />;
 * }
 * ```
 */
export function UserProfileExample() {
  const { data: user, isLoading, error, refetch } = useCurrentUser();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          {error === "No authentication token available"
            ? "Vous devez être connecté pour accéder à cette page"
            : `Impossible de charger le profil utilisateur : ${error}`}
        </AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert className="m-4">
        <AlertTitle>Aucun utilisateur</AlertTitle>
        <AlertDescription>
          Aucune donnée utilisateur disponible
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Profil Utilisateur (depuis le backend)</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">ID</dt>
            <dd className="text-sm">{user.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
            <dd className="text-sm">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Nom</dt>
            <dd className="text-sm">{user.name}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
