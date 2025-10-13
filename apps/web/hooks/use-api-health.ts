"use client";

import { backendApiClient } from "@/lib/backend-api-client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface ApiHealthStatus {
  isConnected: boolean;
  isTokenValid: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
}

interface UseApiHealthOptions {
  /** Intervalle de vérification en millisecondes (par défaut: 60000 = 1 minute) */
  checkInterval?: number;
  /** Activer la vérification automatique (par défaut: true) */
  autoCheck?: boolean;
  /** Afficher les notifications (par défaut: true) */
  showNotifications?: boolean;
  /** Callback appelé lors du changement de statut */
  onStatusChange?: (status: ApiHealthStatus) => void;
}

/**
 * Hook pour vérifier la santé de l'API et la validité du token utilisateur
 *
 * @example
 * ```tsx
 * const { status, checkHealth } = useApiHealth({
 *   checkInterval: 60000,
 *   showNotifications: true
 * });
 *
 * if (!status.isConnected) {
 *   return <div>API déconnectée</div>;
 * }
 * ```
 */
export function useApiHealth(options: UseApiHealthOptions = {}) {
  const {
    checkInterval = 60000, // 1 minute
    autoCheck = true,
    onStatusChange,
  } = options;

  // Utiliser useRef pour éviter les re-renders causés par onStatusChange
  const onStatusChangeRef = useRef(onStatusChange);

  // Mettre à jour la ref sans causer de re-render
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const [status, setStatus] = useState<ApiHealthStatus>({
    isConnected: false,
    isTokenValid: false,
    isChecking: false,
    lastChecked: null,
    error: null,
  });

  const checkHealth = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      // 1. Vérifier la connexion à l'API via /users/me
      const response = await backendApiClient.get("/api/v1/users/me");

      const newStatus: ApiHealthStatus = {
        isConnected: true,
        isTokenValid: true,
        isChecking: false,
        lastChecked: new Date(),
        error: null,
      };

      setStatus(newStatus);

      if (onStatusChangeRef.current) {
        onStatusChangeRef.current(newStatus);
      }

      return { success: true, data: response.data };
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const isConnectionError =
        err.message?.includes("fetch") ||
        err.message?.includes("Network") ||
        err.code === "ECONNREFUSED";

      const isAuthError =
        err.response?.status === 401 || err.response?.status === 403;

      const newStatus: ApiHealthStatus = {
        isConnected: !isConnectionError,
        isTokenValid: !isAuthError,
        isChecking: false,
        lastChecked: new Date(),
        error: err.message || "Erreur inconnue",
      };

      setStatus(newStatus);

      if (onStatusChangeRef.current) {
        onStatusChangeRef.current(newStatus);
      }

      return {
        success: false,
        error: err.message,
        isConnectionError,
        isAuthError,
      };
    }
  }, []); // Pas de dépendance - on utilise onStatusChangeRef

  // Vérification automatique au montage et à intervalle régulier
  useEffect(() => {
    if (!autoCheck) return;

    // Délai initial pour laisser le temps à l'app de se charger
    const initialTimeout = setTimeout(() => {
      checkHealth();
    }, 1000); // 1 seconde de délai

    // Vérification périodique
    const intervalId = setInterval(checkHealth, checkInterval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [autoCheck, checkInterval, checkHealth]);

  return {
    status,
    checkHealth,
    isReady: status.isConnected && status.isTokenValid,
  };
}
