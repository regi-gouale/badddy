// Mock pour la bibliothèque jose utilisée dans les tests E2E
// Ce mock permet d'éviter les problèmes de transformation ESM dans Jest

export const createRemoteJWKSet = jest.fn().mockReturnValue({});

export const jwtVerify = jest.fn().mockResolvedValue({
  payload: {
    sub: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
});

export interface JWTPayload {
  sub?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}
