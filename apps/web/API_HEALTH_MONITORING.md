# Système de Notification de Santé de l'API

## 📋 Vue d'ensemble

Ce système surveille automatiquement la connexion à l'API backend et la validité du token d'authentification. Il notifie l'utilisateur en temps réel des changements d'état via des toasts.

## 🎯 Fonctionnalités

- ✅ **Vérification automatique** : Vérifie l'état de l'API à intervalle régulier (par défaut: 1 minute)
- 🔔 **Notifications en temps réel** : Toasts pour informer des changements d'état
- 🔒 **Détection d'expiration de token** : Alerte si le token est invalide/expiré
- 🌐 **Détection de déconnexion** : Alerte si l'API est inaccessible
- 🎨 **Badge visuel optionnel** : Composant UI pour afficher l'état en permanence
- 🚦 **Routes protégées uniquement** : Vérifie seulement sur les routes nécessitant une authentification

## 📦 Fichiers créés

```
apps/web/
├── hooks/
│   └── use-api-health.ts                    # Hook de vérification de santé
├── components/
│   ├── providers/
│   │   └── api-health-provider.tsx          # Provider global avec notifications
│   └── api-status-badge.tsx                 # Badge visuel d'état (optionnel)
└── app/
    └── layout.tsx                            # Intégration du provider
```

## 🚀 Installation et Configuration

### 1. Provider déjà intégré

Le `ApiHealthProvider` est automatiquement intégré dans `app/layout.tsx` :

```tsx
<ApiHealthProvider
  checkInterval={60000} // Vérification toutes les 60 secondes
  showNotifications={true} // Afficher les toasts
  protectedRoutesOnly={true} // Vérifier uniquement les routes protégées
>
  {/* Votre application */}
</ApiHealthProvider>
```

### 2. Configuration personnalisée

Vous pouvez modifier les paramètres dans `app/layout.tsx` :

```tsx
<ApiHealthProvider
  checkInterval={30000}           // Vérifier toutes les 30 secondes
  showNotifications={true}
  protectedRoutesOnly={false}     // Vérifier sur toutes les routes
>
```

## 🎨 Utilisation du hook `useApiHealth`

### Exemple basique

```tsx
"use client";

import { useApiHealth } from "@/hooks/use-api-health";

export function MyComponent() {
  const { status, checkHealth, isReady } = useApiHealth();

  if (!isReady) {
    return <div>Connexion à l'API en cours...</div>;
  }

  return (
    <div>
      <p>API connectée : {status.isConnected ? "✅" : "❌"}</p>
      <p>Token valide : {status.isTokenValid ? "✅" : "❌"}</p>
      <button onClick={checkHealth}>Vérifier maintenant</button>
    </div>
  );
}
```

### Avec callback personnalisé

```tsx
const { status } = useApiHealth({
  checkInterval: 30000,
  autoCheck: true,
  onStatusChange: (newStatus) => {
    console.log("Nouvel état:", newStatus);
    // Logique personnalisée (analytics, logging, etc.)
  },
});
```

### Vérification manuelle uniquement

```tsx
const { checkHealth, status } = useApiHealth({
  autoCheck: false, // Pas de vérification automatique
});

// Vérifier manuellement
const handleCheck = async () => {
  await checkHealth();
};
```

## 🎨 Badge visuel d'état

### Variante compacte (navbar, header)

```tsx
import { ApiStatusBadge } from "@/components/api-status-badge";

export function Navbar() {
  return (
    <nav>
      <div className="flex items-center gap-4">
        <Logo />
        <ApiStatusBadge variant="compact" />
      </div>
    </nav>
  );
}
```

### Variante complète (dashboard, settings)

```tsx
export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1>Dashboard</h1>
      <ApiStatusBadge
        variant="default"
        showLastCheck={true}
        showRefreshButton={true}
      />
    </div>
  );
}
```

## 🔔 Types de notifications

### 1. Connexion établie (une seule fois au chargement)

```
✅ Connexion à l'API établie
   Votre session est active et sécurisée
```

### 2. API déconnectée

```
❌ API déconnectée
   Impossible de joindre le serveur. Vérifiez votre connexion.
```

### 3. API reconnectée

```
✅ API reconnectée
   La connexion au serveur est rétablie
```

### 4. Token invalide/expiré

```
❌ Session expirée
   Votre token est invalide ou expiré. Reconnectez-vous.
   [Bouton: Se reconnecter]
```

### 5. Token redevenu valide

```
✅ Token valide
   Votre session est à nouveau active
```

## 📊 Interface `ApiHealthStatus`

```typescript
interface ApiHealthStatus {
  isConnected: boolean; // API accessible
  isTokenValid: boolean; // Token valide
  isChecking: boolean; // Vérification en cours
  lastChecked: Date | null; // Dernière vérification
  error: string | null; // Message d'erreur
}
```

## 🔧 API du hook

### `useApiHealth(options?)`

#### Options

- `checkInterval?: number` - Intervalle de vérification en ms (défaut: 60000)
- `autoCheck?: boolean` - Vérification automatique (défaut: true)
- `showNotifications?: boolean` - Afficher les notifications (défaut: true)
- `onStatusChange?: (status: ApiHealthStatus) => void` - Callback lors du changement

#### Retour

- `status: ApiHealthStatus` - État actuel de la connexion
- `checkHealth: () => Promise<Result>` - Fonction de vérification manuelle
- `isReady: boolean` - true si API connectée ET token valide

## 🎯 Cas d'usage

### 1. Afficher un message de chargement

```tsx
const { isReady } = useApiHealth();

if (!isReady) {
  return <LoadingSpinner message="Connexion à l'API..." />;
}
```

### 2. Rediriger vers login si token invalide

```tsx
const { status } = useApiHealth({
  onStatusChange: (newStatus) => {
    if (!newStatus.isTokenValid && newStatus.isConnected) {
      router.push("/login");
    }
  },
});
```

### 3. Logger les événements

```tsx
useApiHealth({
  onStatusChange: (status) => {
    if (!status.isConnected) {
      analytics.track("api_disconnected", {
        error: status.error,
        timestamp: status.lastChecked,
      });
    }
  },
});
```

### 4. Afficher un banner d'avertissement

```tsx
const { status } = useApiHealth();

return (
  <div>
    {!status.isConnected && (
      <Banner variant="warning">
        L'API est actuellement indisponible. Certaines fonctionnalités peuvent
        être limitées.
      </Banner>
    )}
    {/* Reste de l'application */}
  </div>
);
```

## 🧪 Tests

### Tester la déconnexion

1. Arrêter le serveur backend : `pnpm --filter backend run stop`
2. Observer le toast "API déconnectée"
3. Redémarrer : `pnpm --filter backend run dev`
4. Observer le toast "API reconnectée"

### Tester l'expiration du token

1. Supprimer le token dans les cookies du navigateur
2. Attendre la prochaine vérification (max 1 minute)
3. Observer le toast "Session expirée"

## ⚡ Performance

- **Impact minimal** : Requête GET légère toutes les 60 secondes
- **Désactivation sur routes publiques** : Ne vérifie pas sur `/`, `/login`, `/register`
- **Cache** : Utilise le cache HTTP du navigateur si configuré
- **Optimisé** : Aucune vérification si l'utilisateur est inactif

## 🔒 Sécurité

- ✅ Vérifie le token via `/api/v1/users/me` (endpoint protégé)
- ✅ Ne stocke pas le token côté client
- ✅ Utilise les cookies HTTP-only de Better Auth
- ✅ Détecte les erreurs 401/403 (unauthorized/forbidden)

## 📝 Routes publiques (pas de vérification)

Par défaut, les routes suivantes ne sont **pas vérifiées** :

- `/` (page d'accueil)
- `/login` (connexion)
- `/register` (inscription)

Pour désactiver ce comportement :

```tsx
<ApiHealthProvider protectedRoutesOnly={false}>
```

## 🎨 Personnalisation du badge

```tsx
<ApiStatusBadge
  variant="compact" // "default" | "compact"
  showLastCheck={true} // Afficher la dernière vérification
  showRefreshButton={true} // Bouton de rafraîchissement manuel
  className="custom-class" // Classes Tailwind personnalisées
/>
```

## 🚨 Gestion des erreurs

Le système distingue deux types d'erreurs :

1. **Erreurs de connexion** (API inaccessible)
   - `isConnected: false`
   - Causes : serveur éteint, problème réseau, URL invalide

2. **Erreurs d'authentification** (token invalide)
   - `isConnected: true`
   - `isTokenValid: false`
   - Causes : token expiré, token révoqué, utilisateur déconnecté

## 📈 Améliorations futures

- [ ] Mode "offline-first" avec cache local
- [ ] Retry automatique avec backoff exponentiel
- [ ] Websocket pour notifications en temps réel
- [ ] Analytics des temps de réponse
- [ ] Mode "maintenance" avec message personnalisé
- [ ] Détection de qualité de connexion (3G/4G/5G/WiFi)

## 🆘 Dépannage

### Les notifications n'apparaissent pas

- Vérifier que `showNotifications={true}` dans le provider
- Vérifier que `ToasterProvider` est bien monté
- Ouvrir la console pour voir les logs

### Vérification trop fréquente

- Augmenter `checkInterval` (ex: 120000 pour 2 minutes)

### Badge ne s'affiche pas

- Vérifier l'import : `import { ApiStatusBadge } from "@/components/api-status-badge"`
- Vérifier que le hook fonctionne dans la console

### Faux positifs de déconnexion

- Vérifier que `BACKEND_INTERNAL_URL` est correct dans `.env`
- Vérifier les logs backend pour les erreurs CORS

## 📚 Références

- **Backend API** : `/api/v1/users/me` (endpoint de vérification)
- **Better Auth** : Gestion des sessions et tokens
- **Sonner** : Bibliothèque de toasts utilisée
- **React Query** : Déjà utilisé dans le projet pour les requêtes

---

✅ **Système prêt à l'emploi** : Aucune configuration supplémentaire nécessaire !
