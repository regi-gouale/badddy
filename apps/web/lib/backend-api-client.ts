import { authClient } from "./auth-client";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_INTERNAL_URL ||
  "http://localhost:8080";

/**
 * Client HTTP pour appeler le backend NestJS avec authentification automatique
 */
class BackendApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Récupère le JWT token depuis Better Auth
   */
  private async getToken(): Promise<string | null> {
    try {
      // @ts-expect-error - Better Auth JWT plugin adds token() method at runtime
      const result = await authClient.token();
      return result.data?.token || null;
    } catch (error) {
      console.error("Failed to get JWT token:", error);
      return null;
    }
  }

  /**
   * Effectue une requête HTTP au backend avec authentification
   */
  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: string; status: number }> {
    try {
      const token = await this.getToken();

      if (!token) {
        return {
          error: "No authentication token available",
          status: 401,
        };
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || `API Error: ${response.status}`,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        status: 0,
      };
    }
  }

  /**
   * Effectue une requête GET
   */
  async get<T = unknown>(
    endpoint: string
  ): Promise<{
    data?: T;
    error?: string;
    status: number;
  }> {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  /**
   * Effectue une requête POST
   */
  async post<T = unknown>(
    endpoint: string,
    body: unknown
  ): Promise<{ data?: T; error?: string; status: number }> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Effectue une requête PUT
   */
  async put<T = unknown>(
    endpoint: string,
    body: unknown
  ): Promise<{ data?: T; error?: string; status: number }> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  /**
   * Effectue une requête DELETE
   */
  async delete<T = unknown>(
    endpoint: string
  ): Promise<{
    data?: T;
    error?: string;
    status: number;
  }> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  /**
   * Exemple : Récupère le profil de l'utilisateur courant
   */
  async getCurrentUser(): Promise<{
    data?: { user: { id: string; email: string; name: string } };
    error?: string;
    status: number;
  }> {
    return this.get("/api/v1/users/me");
  }
}

export const backendApiClient = new BackendApiClient();
export default backendApiClient;
