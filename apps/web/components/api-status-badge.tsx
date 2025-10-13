"use client";

import { useApiHealth } from "@/hooks/use-api-health";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCw, Wifi, WifiOff, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiStatusBadgeProps {
  /** Afficher la dernière vérification (par défaut: true) */
  showLastCheck?: boolean;
  /** Afficher le bouton de rafraîchissement (par défaut: true) */
  showRefreshButton?: boolean;
  /** Variante du badge (par défaut: "default") */
  variant?: "default" | "compact";
  /** Classe CSS personnalisée */
  className?: string;
}

/**
 * Badge visuel affichant l'état de connexion à l'API
 * 
 * @example
 * ```tsx
 * // Dans une navbar ou un dashboard
 * <ApiStatusBadge variant="compact" />
 * ```
 */
export function ApiStatusBadge({
  showLastCheck = true,
  showRefreshButton = true,
  variant = "default",
  className,
}: ApiStatusBadgeProps) {
  const { status, checkHealth, isReady } = useApiHealth({
    checkInterval: 60000,
    autoCheck: true,
  });

  const getStatusIcon = () => {
    if (status.isChecking) {
      return <RefreshCw className="h-3 w-3 animate-spin" />;
    }
    if (!status.isConnected) {
      return <WifiOff className="h-3 w-3" />;
    }
    if (!status.isTokenValid) {
      return <Lock className="h-3 w-3" />;
    }
    return <CheckCircle2 className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (status.isChecking) return "Vérification...";
    if (!status.isConnected) return "API déconnectée";
    if (!status.isTokenValid) return "Token invalide";
    return "Connecté";
  };

  const getStatusColor = () => {
    if (status.isChecking) return "secondary";
    if (!status.isConnected) return "destructive";
    if (!status.isTokenValid) return "destructive";
    return "default";
  };

  const getTooltipContent = () => {
    if (status.isChecking) {
      return "Vérification de la connexion en cours...";
    }
    if (!status.isConnected) {
      return `API déconnectée. ${status.error || "Impossible de joindre le serveur."}`;
    }
    if (!status.isTokenValid) {
      return "Votre token est invalide ou expiré. Veuillez vous reconnecter.";
    }
    return "Connexion établie et token valide";
  };

  const formatLastCheck = () => {
    if (!status.lastChecked) return "Jamais";
    const now = new Date();
    const diff = Math.floor((now.getTime() - status.lastChecked.getTime()) / 1000);
    
    if (diff < 60) return `Il y a ${diff}s`;
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
    return `Il y a ${Math.floor(diff / 3600)}h`;
  };

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={getStatusColor()}
              className={cn(
                "flex items-center gap-1.5 cursor-help",
                className
              )}
            >
              {getStatusIcon()}
              <span className="text-xs font-medium">{getStatusText()}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{getTooltipContent()}</p>
              {showLastCheck && status.lastChecked && (
                <p className="text-xs text-muted-foreground">
                  Dernière vérification : {formatLastCheck()}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border p-2",
        isReady ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {status.isConnected ? (
          <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
        )}
        
        <div className="flex flex-col">
          <span className="text-sm font-medium">{getStatusText()}</span>
          {showLastCheck && status.lastChecked && (
            <span className="text-xs text-muted-foreground">
              {formatLastCheck()}
            </span>
          )}
        </div>
      </div>

      {showRefreshButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => checkHealth()}
          disabled={status.isChecking}
          className="ml-auto h-7 w-7 p-0"
        >
          <RefreshCw
            className={cn(
              "h-3 w-3",
              status.isChecking && "animate-spin"
            )}
          />
          <span className="sr-only">Rafraîchir</span>
        </Button>
      )}
    </div>
  );
}
