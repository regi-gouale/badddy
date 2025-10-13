"use client";

import { ApiStatusBadge } from "@/components/api-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApiHealth } from "@/hooks/use-api-health";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function DashboardApiMonitor() {
  const { status, isReady } = useApiHealth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          État de connexion à l&apos;API
          <ApiStatusBadge variant="compact" showRefreshButton={true} />
        </CardTitle>
        <CardDescription>
          Surveillance en temps réel de la connexion au backend et de la
          validité de votre session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut principal */}
        {isReady ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Connexion établie</AlertTitle>
            <AlertDescription>
              Votre API est accessible et votre token d&apos;authentification
              est valide.
            </AlertDescription>
          </Alert>
        ) : status.isChecking ? (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Vérification en cours...</AlertTitle>
            <AlertDescription>
              Vérification de la connexion à l&apos;API backend.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Problème détecté</AlertTitle>
            <AlertDescription>
              {!status.isConnected
                ? "L&apos;API backend est inaccessible. Vérifiez que le serveur est démarré."
                : "Votre token d&apos;authentification est invalide ou expiré. Reconnectez-vous."}
            </AlertDescription>
          </Alert>
        )}

        {/* Détails techniques */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                status.isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-muted-foreground">
              API: {status.isConnected ? "Connectée" : "Déconnectée"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                status.isTokenValid ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-muted-foreground">
              Token: {status.isTokenValid ? "Valide" : "Invalide"}
            </span>
          </div>
        </div>

        {/* Informations supplémentaires */}
        {status.lastChecked && (
          <div className="text-xs text-muted-foreground">
            Dernière vérification :{" "}
            {new Date(status.lastChecked).toLocaleTimeString("fr-FR")}
          </div>
        )}

        {status.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
            <strong>Erreur :</strong> {status.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
