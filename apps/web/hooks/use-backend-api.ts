import { backendApiClient } from "@/lib/backend-api-client";
import { useCallback, useState } from "react";

interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  status: number | null;
}

/**
 * Hook personnalisé pour effectuer des requêtes au backend NestJS
 *
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useBackendApi<User>();
 *
 * useEffect(() => {
 *   execute('/api/v1/users/me', 'GET');
 * }, []);
 * ```
 */
export function useBackendApi<T = unknown>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    loading: false,
    status: null,
  });

  const execute = useCallback(
    async (
      endpoint: string,
      method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
      body?: unknown
    ) => {
      setState({ data: null, error: null, loading: true, status: null });

      try {
        let result;

        switch (method) {
          case "GET":
            result = await backendApiClient.get<T>(endpoint);
            break;
          case "POST":
            result = await backendApiClient.post<T>(endpoint, body);
            break;
          case "PUT":
            result = await backendApiClient.put<T>(endpoint, body);
            break;
          case "DELETE":
            result = await backendApiClient.delete<T>(endpoint);
            break;
        }

        if (result.error) {
          setState({
            data: null,
            error: result.error,
            loading: false,
            status: result.status,
          });
        } else {
          setState({
            data: result.data || null,
            error: null,
            loading: false,
            status: result.status,
          });
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        setState({
          data: null,
          error: errorMessage,
          loading: false,
          status: 0,
        });

        return { error: errorMessage, status: 0 };
      }
    },
    []
  );

  return { ...state, execute };
}

/**
 * Hook React Query pour récupérer le profil de l'utilisateur courant
 *
 * @example
 * ```tsx
 * const { data: user, isLoading, error } = useCurrentUser();
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <div>Error: {error}</div>;
 *
 * return <div>Welcome {user?.name}</div>;
 * ```
 */
export function useCurrentUser() {
  const { data, loading, error, execute } = useBackendApi<{
    user: { id: string; email: string; name: string };
  }>();

  const fetchUser = useCallback(async () => {
    return execute("/api/v1/users/me", "GET");
  }, [execute]);

  return {
    data: data?.user || null,
    isLoading: loading,
    error,
    refetch: fetchUser,
  };
}
