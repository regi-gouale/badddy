# Guide d'utilisation de l'API Backend (Frontend)

Ce guide explique comment appeler les endpoints protégés du backend NestJS depuis le frontend Next.js.

## 📋 Table des matières

- [Configuration automatique](#configuration-automatique)
- [Utilisation du client API](#utilisation-du-client-api)
- [Hooks React](#hooks-react)
- [Composants d'exemple](#composants-dexemple)
- [Gestion des erreurs](#gestion-des-erreurs)

---

## Configuration automatique

L'authentification JWT est gérée automatiquement. Le client backend API :

1. Récupère automatiquement le JWT token depuis Better Auth
2. L'ajoute dans le header `Authorization: Bearer <token>`
3. Gère les erreurs d'authentification

**Aucune configuration manuelle n'est nécessaire !**

---

## Utilisation du client API

### Import du client

```typescript
import { backendApiClient } from "@/lib/backend-api-client";
```

### Méthodes disponibles

#### GET Request

```typescript
const { data, error, status } = await backendApiClient.get("/api/v1/users/me");

if (error) {
  console.error("Error:", error);
} else {
  console.log("User:", data);
}
```

#### POST Request

```typescript
const { data, error, status } = await backendApiClient.post("/api/v1/users", {
  name: "John Doe",
  email: "john@example.com",
});
```

#### PUT Request

```typescript
const { data, error, status } = await backendApiClient.put(
  "/api/v1/users/123",
  {
    name: "Jane Doe",
  }
);
```

#### DELETE Request

```typescript
const { data, error, status } =
  await backendApiClient.delete("/api/v1/users/123");
```

### Méthode helper - getCurrentUser

Pour récupérer le profil de l'utilisateur courant :

```typescript
const { data, error, status } = await backendApiClient.getCurrentUser();

if (data) {
  console.log("User:", data.user);
}
```

---

## Hooks React

### useBackendApi

Hook générique pour effectuer des requêtes au backend.

```typescript
import { useBackendApi } from '@/hooks/use-backend-api';

function MyComponent() {
  const { data, loading, error, execute } = useBackendApi<User>();

  useEffect(() => {
    execute('/api/v1/users/me', 'GET');
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;

  return <div>{data?.name}</div>;
}
```

**Paramètres de `execute` :**

- `endpoint` : L'URL de l'endpoint (ex: `/api/v1/users/me`)
- `method` : La méthode HTTP (`'GET'`, `'POST'`, `'PUT'`, `'DELETE'`)
- `body` : Le corps de la requête (optionnel, pour POST/PUT)

**Retour :**

- `data` : Les données de la réponse
- `loading` : État de chargement
- `error` : Message d'erreur si échec
- `status` : Code HTTP de la réponse
- `execute` : Fonction pour déclencher la requête

### useCurrentUser

Hook spécialisé pour récupérer le profil de l'utilisateur courant.

```typescript
import { useCurrentUser } from '@/hooks/use-backend-api';

function UserProfile() {
  const { data: user, isLoading, error, refetch } = useCurrentUser();

  useEffect(() => {
    refetch();
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
    </div>
  );
}
```

**Retour :**

- `data` : Objet utilisateur ou `null`
- `isLoading` : État de chargement
- `error` : Message d'erreur si échec
- `refetch` : Fonction pour recharger les données

---

## Composants d'exemple

### UserProfileExample

Un composant complet qui démontre l'utilisation de l'API :

```typescript
import { UserProfileExample } from '@/components/examples/user-profile-example';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <UserProfileExample />
    </div>
  );
}
```

Ce composant gère automatiquement :

- ✅ Le chargement des données
- ✅ L'affichage d'un spinner pendant le chargement
- ✅ La gestion des erreurs (authentification, réseau, etc.)
- ✅ L'affichage des données utilisateur

---

## Gestion des erreurs

### Types d'erreurs courants

#### 1. Pas de token d'authentification

```typescript
{
  error: "No authentication token available",
  status: 401
}
```

**Solution :** L'utilisateur doit se connecter.

#### 2. Token invalide ou expiré

```typescript
{
  error: "Unauthorized",
  status: 401
}
```

**Solution :** Rediriger vers la page de connexion.

#### 3. Erreur réseau

```typescript
{
  error: "Failed to fetch",
  status: 0
}
```

**Solution :** Vérifier la connexion internet et que le backend est démarré.

### Exemple de gestion d'erreurs

```typescript
const { data, error, status } = await backendApiClient.get("/api/v1/users/me");

if (error) {
  switch (status) {
    case 401:
      // Rediriger vers login
      router.push("/login");
      break;
    case 403:
      // Accès refusé
      toast.error("Vous n'avez pas les permissions nécessaires");
      break;
    case 500:
      // Erreur serveur
      toast.error("Une erreur est survenue sur le serveur");
      break;
    default:
      toast.error(`Erreur : ${error}`);
  }
}
```

---

## Variables d'environnement

Le client utilise automatiquement ces variables d'environnement :

```env
# URL du backend NestJS
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
# Ou si vous utilisez Server Components
BACKEND_INTERNAL_URL=http://localhost:8080

# URL de Better Auth (pour récupérer les JWT)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

---

## Exemples complets

### Exemple 1 : Récupération de liste

```typescript
'use client';

import { useEffect } from 'react';
import { useBackendApi } from '@/hooks/use-backend-api';

interface Post {
  id: string;
  title: string;
  content: string;
}

export function PostList() {
  const { data, loading, error, execute } = useBackendApi<Post[]>();

  useEffect(() => {
    execute('/api/v1/posts', 'GET');
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <ul>
      {data?.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### Exemple 2 : Création de ressource

```typescript
'use client';

import { useState } from 'react';
import { useBackendApi } from '@/hooks/use-backend-api';
import { toast } from 'sonner';

interface CreatePostData {
  title: string;
  content: string;
}

export function CreatePostForm() {
  const { execute } = useBackendApi<Post>();
  const [formData, setFormData] = useState<CreatePostData>({
    title: '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await execute('/api/v1/posts', 'POST', formData);

    if (result.error) {
      toast.error(`Erreur : ${result.error}`);
    } else {
      toast.success('Article créé avec succès !');
      setFormData({ title: '', content: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Titre"
      />
      <textarea
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        placeholder="Contenu"
      />
      <button type="submit">Créer</button>
    </form>
  );
}
```

### Exemple 3 : Server Component avec fetch direct

```typescript
// app/(app)/users/page.tsx
import { cookies } from 'next/headers';

async function getUserFromBackend() {
  // Récupérer le token depuis les cookies Better Auth
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('better-auth.session_token')?.value;

  if (!sessionToken) {
    return null;
  }

  // Appeler le backend avec le token
  const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:8080';

  const response = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function UsersPage() {
  const user = await getUserFromBackend();

  if (!user) {
    return <div>Utilisateur non connecté</div>;
  }

  return (
    <div>
      <h1>Profil</h1>
      <p>Email : {user.email}</p>
      <p>Nom : {user.name}</p>
    </div>
  );
}
```

---

## Tests

Pour tester l'intégration :

1. **Démarrer les services :**

```bash
# Terminal 1 - Frontend
pnpm --filter web dev

# Terminal 2 - Backend
pnpm --filter backend dev
```

2. **Se connecter** sur le frontend à `http://localhost:3000`

3. **Tester un endpoint protégé :**
   - Créer une page avec `<UserProfileExample />`
   - Vérifier que les données s'affichent correctement

4. **Tester sans authentification :**
   - Se déconnecter
   - Vérifier que l'erreur 401 s'affiche correctement

---

## Résumé

| Méthode                  | Usage              | Contexte                          |
| ------------------------ | ------------------ | --------------------------------- |
| `backendApiClient.get()` | Requêtes simples   | Client Components, Event Handlers |
| `useBackendApi()`        | Hook générique     | Client Components avec état       |
| `useCurrentUser()`       | Profil utilisateur | Client Components                 |
| `fetch()` direct         | SSR, ISR           | Server Components, API Routes     |

**Toutes les méthodes gèrent automatiquement l'authentification JWT !** 🎉
