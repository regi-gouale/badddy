/**
 * Interface représentant un utilisateur authentifié
 * Utilisée dans les guards, decorators et controllers
 */
export interface User {
  id: string;
  email: string;
  name: string;
  [key: string]: unknown;
}
