"use client";

import { useApiHealth, type ApiHealthStatus } from "@/hooks/use-api-health";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

interface ApiHealthProviderProps {
  children: React.ReactNode;
  /** Afficher les notifications (par défaut: true) */
  showNotifications?: boolean;
  /** Intervalle de vérification en ms (par défaut: 60000 = 1 minute) */
  checkInterval?: number;
  /** Activer uniquement sur les routes protégées (par défaut: true) */
  protectedRoutesOnly?: boolean;
}

/**
 * Provider pour surveiller la santé de l'API et afficher des notifications
 *
 * Affiche des toasts pour informer l'utilisateur de l'état de connexion:
 * - ✅ Connexion établie et token valide
 * - ⚠️ API déconnectée
 * - 🔒 Token invalide ou expiré
 */
export function ApiHealthProvider({
  children,
  showNotifications = true,
  checkInterval = 60000,
  protectedRoutesOnly = true,
}: ApiHealthProviderProps) {
  const pathname = usePathname();
  const previousStatusRef = useRef<ApiHealthStatus | null>(null);
  const hasShownInitialToast = useRef(false);

  // Routes publiques qui n'ont pas besoin de vérification
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  const shouldCheck = !protectedRoutesOnly || !isPublicRoute;

  const handleStatusChange = useCallback(
    (newStatus: ApiHealthStatus) => {
      if (!showNotifications) return;

      const prevStatus = previousStatusRef.current;

      // Notification initiale (seulement une fois si connexion réussie)
      if (
        !hasShownInitialToast.current &&
        newStatus.isConnected &&
        newStatus.isTokenValid &&
        !newStatus.isChecking
      ) {
        toast.success("Connexion à l'API établie", {
          description: "Votre session est active et sécurisée",
          duration: 3000,
        });
        hasShownInitialToast.current = true;
      }

      // Si c'est le premier check, on stocke juste l'état (pas de notification)
      if (!prevStatus) {
        previousStatusRef.current = newStatus;
        return;
      }

      // Détection des changements d'état
      const connectionChanged =
        prevStatus.isConnected !== newStatus.isConnected;
      const tokenValidityChanged =
        prevStatus.isTokenValid !== newStatus.isTokenValid;

      // 🔌 API déconnectée
      if (connectionChanged && !newStatus.isConnected) {
        toast.error("API déconnectée", {
          description:
            "Impossible de joindre le serveur. Vérifiez votre connexion.",
          duration: 5000,
        });
      }

      // ✅ API reconnectée
      if (connectionChanged && newStatus.isConnected) {
        toast.success("API reconnectée", {
          description: "La connexion au serveur est rétablie",
          duration: 3000,
        });
      }

      // 🔒 Token invalide/expiré
      if (
        tokenValidityChanged &&
        !newStatus.isTokenValid &&
        newStatus.isConnected
      ) {
        toast.error("Session expirée", {
          description: "Votre token est invalide ou expiré. Reconnectez-vous.",
          duration: 5000,
          action: {
            label: "Se reconnecter",
            onClick: () => {
              window.location.href = "/login";
            },
          },
        });
      }

      // ✅ Token redevenu valide (après reconnexion)
      if (
        tokenValidityChanged &&
        newStatus.isTokenValid &&
        newStatus.isConnected
      ) {
        toast.success("Token valide", {
          description: "Votre session est à nouveau active",
          duration: 3000,
        });
      }

      previousStatusRef.current = newStatus;
    },
    [showNotifications]
  );

  useApiHealth({
    checkInterval,
    autoCheck: shouldCheck,
    showNotifications,
    onStatusChange: handleStatusChange,
  });

  // Reset le flag de toast initial quand on change de route
  useEffect(() => {
    if (isPublicRoute) {
      hasShownInitialToast.current = false;
      previousStatusRef.current = null;
    }
  }, [isPublicRoute]);

  return <>{children}</>;
}
