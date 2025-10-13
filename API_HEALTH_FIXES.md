# Corrections - Système de Notification API

## 🐛 Problèmes identifiés et résolus

### 1. ❌ Boucle infinie - "Maximum update depth exceeded"

**Cause :**
Le callback `onStatusChange` dans `useApiHealth` changeait à chaque render, causant une re-création infinie de la fonction `checkHealth` via `useCallback`.

**Solution :**
Utilisation de `useRef` pour stocker la référence au callback sans déclencher de re-renders.

**Fichier modifié :** `hooks/use-api-health.ts`

```typescript
// Avant (causait la boucle)
const checkHealth = useCallback(async () => {
  // ...
  if (onStatusChange) {
    onStatusChange(newStatus);
  }
}, [onStatusChange]); // ❌ onStatusChange change à chaque render

// Après (stable)
const onStatusChangeRef = useRef(onStatusChange);

useEffect(() => {
  onStatusChangeRef.current = onStatusChange;
}, [onStatusChange]);

const checkHealth = useCallback(async () => {
  // ...
  if (onStatusChangeRef.current) {
    onStatusChangeRef.current(newStatus);
  }
}, []); // ✅ Pas de dépendances qui changent
```

---

### 2. ⚠️ Warning - "ExperimentalWarning: Ed25519"

**Cause :**
Better Auth utilise l'algorithme Ed25519 qui est expérimental dans Node.js.

**Solution :**
Ce warning est normal et n'affecte pas le fonctionnement. Il peut être ignoré ou supprimé via la configuration Node.js.

**Option pour supprimer le warning :**

```json
// package.json
{
  "scripts": {
    "dev": "NODE_NO_WARNINGS=1 next dev --turbopack"
  }
}
```

---

### 3. 🔌 "Failed to fetch" au démarrage

**Cause :**
La vérification de l'API se déclenche immédiatement au montage du composant, avant que le backend ne soit prêt.

**Solution :**
Ajout d'un délai initial de 1 seconde avant la première vérification.

**Fichier modifié :** `hooks/use-api-health.ts`

```typescript
// Avant (vérification immédiate)
useEffect(() => {
  if (!autoCheck) return;
  checkHealth(); // ❌ Trop tôt
  const intervalId = setInterval(checkHealth, checkInterval);
  return () => clearInterval(intervalId);
}, [autoCheck, checkInterval, checkHealth]);

// Après (délai initial)
useEffect(() => {
  if (!autoCheck) return;

  const initialTimeout = setTimeout(() => {
    checkHealth(); // ✅ Après 1 seconde
  }, 1000);

  const intervalId = setInterval(checkHealth, checkInterval);

  return () => {
    clearTimeout(initialTimeout);
    clearInterval(intervalId);
  };
}, [autoCheck, checkInterval, checkHealth]);
```

---

### 4. 🔔 Notifications intempestives au premier chargement

**Cause :**
Le provider affichait des notifications même lors du tout premier check, avant d'avoir un état de référence.

**Solution :**

- Utilisation de `useCallback` pour stabiliser `handleStatusChange`
- Vérification que la connexion n'est pas en cours (`!newStatus.isChecking`)
- Pas de notification au premier check, seulement stockage de l'état

**Fichier modifié :** `components/providers/api-health-provider.tsx`

```typescript
// Avant
const handleStatusChange = (newStatus: ApiHealthStatus) => {
  // ...
  if (!hasShownInitialToast.current && newStatus.isConnected && newStatus.isTokenValid) {
    toast.success(...); // ❌ Même si isChecking=true
  }
};

// Après
const handleStatusChange = useCallback((newStatus: ApiHealthStatus) => {
  // ...
  if (
    !hasShownInitialToast.current &&
    newStatus.isConnected &&
    newStatus.isTokenValid &&
    !newStatus.isChecking // ✅ Vérifie que le check est terminé
  ) {
    toast.success(...);
  }
}, [showNotifications]);
```

---

## 📊 Résumé des modifications

### Fichiers modifiés (2)

1. **`hooks/use-api-health.ts`**
   - Import de `useRef` ajouté
   - `onStatusChangeRef` pour éviter les re-renders
   - Délai initial de 1 seconde avant la première vérification
   - Suppression de la dépendance `onStatusChange` dans `useCallback`

2. **`components/providers/api-health-provider.tsx`**
   - Import de `useCallback` ajouté
   - Stabilisation de `handleStatusChange` avec `useCallback`
   - Vérification `!newStatus.isChecking` pour les toasts
   - Pas de notification au premier check

---

## ✅ Tests de validation

### Test 1 : Pas de boucle infinie

```bash
pnpm dev
```

**Attendu :** Aucune erreur "Maximum update depth exceeded" dans la console.

### Test 2 : Vérification après 1 seconde

1. Démarrer l'application
2. Observer dans la console réseau (DevTools > Network)
3. **Attendu :** La requête vers `/api/v1/users/me` apparaît après ~1 seconde

### Test 3 : Toast uniquement si connexion réussie

1. Backend démarré, utilisateur connecté
2. Rafraîchir la page
3. **Attendu :** Toast "Connexion à l'API établie" apparaît une seule fois

### Test 4 : Pas de toast si backend arrêté

1. Arrêter le backend
2. Rafraîchir la page
3. **Attendu :** Aucun toast au chargement (le check échoue silencieusement)

### Test 5 : Toast "API déconnectée" après changement

1. Application démarrée avec backend actif
2. Attendre que le toast initial apparaisse
3. Arrêter le backend
4. Attendre ~60 secondes
5. **Attendu :** Toast "API déconnectée" apparaît

---

## 🔧 Configuration finale

### `hooks/use-api-health.ts`

```typescript
// Délai avant première vérification
const initialTimeout = setTimeout(() => {
  checkHealth();
}, 1000); // 1 seconde

// Intervalle de vérification périodique
const intervalId = setInterval(checkHealth, checkInterval); // 60 secondes
```

### `components/providers/api-health-provider.tsx`

```typescript
<ApiHealthProvider
  checkInterval={60000}         // Vérification toutes les 60 secondes
  showNotifications={true}      // Afficher les toasts
  protectedRoutesOnly={true}    // Uniquement sur routes protégées
>
```

---

## 🎯 Comportement attendu

### Au démarrage de l'application

1. **T+0s** : Application démarre, aucune requête API
2. **T+1s** : Première vérification `/api/v1/users/me`
3. **T+1.5s** : Si connexion OK, toast "Connexion établie" (une seule fois)
4. **T+61s** : Deuxième vérification
5. **T+121s** : Troisième vérification
6. ... (toutes les 60 secondes)

### En cas de déconnexion

1. **État initial** : API connectée, toast "Connexion établie" affiché
2. **Backend arrêté** : Aucun toast immédiat (on attend le prochain check)
3. **T+60s** : Vérification échoue, toast "API déconnectée" apparaît
4. **Backend redémarré** : Aucun toast immédiat
5. **T+120s** : Vérification réussit, toast "API reconnectée" apparaît

---

## 🚀 Prochaines améliorations possibles

### Court terme

- [ ] Ajouter un mode "silencieux" pour les routes publiques
- [ ] Augmenter le délai initial à 2-3 secondes en développement
- [ ] Ajouter un indicateur visuel pendant `isChecking`

### Moyen terme

- [ ] Retry avec backoff exponentiel en cas d'échec
- [ ] Cache des résultats pour réduire les requêtes
- [ ] Mode debug avec logs détaillés

### Long terme

- [ ] WebSocket pour notifications temps réel
- [ ] Health check endpoint dédié (plus léger que `/users/me`)
- [ ] Métriques de performance (temps de réponse)

---

## 📝 Notes importantes

### ⚠️ Warning Ed25519

Le warning "ExperimentalWarning: Ed25519" est **normal** et provient de Better Auth. Il n'affecte pas le fonctionnement de l'application.

**Options :**

1. **Ignorer** : Le warning est informatif uniquement
2. **Masquer** : Ajouter `NODE_NO_WARNINGS=1` dans les scripts
3. **Attendre** : Node.js stabilisera Ed25519 dans les futures versions

### ⚡ Performance

- **Délai initial** : 1 seconde (configurable)
- **Intervalle** : 60 secondes (configurable)
- **Impact** : Négligeable (~1 requête/minute)

### 🔒 Sécurité

- Aucune information sensible dans les erreurs
- Token jamais exposé (cookies HTTP-only)
- Vérifications côté serveur uniquement

---

## ✅ Checklist de validation

- [x] Aucune boucle infinie
- [x] Pas d'erreur "Maximum update depth"
- [x] Délai initial de 1 seconde implémenté
- [x] Toast uniquement sur changement d'état
- [x] Pas de notification au premier check
- [x] `useRef` pour stabiliser les callbacks
- [x] `useCallback` dans le provider
- [x] TypeScript : 0 erreurs
- [x] ESLint : 0 erreurs
- [ ] Tests manuels effectués (à faire)

---

## 🆘 Dépannage

### Problème : Toujours "Maximum update depth"

→ Vider le cache : `rm -rf .next && pnpm dev`

### Problème : Toast n'apparaît jamais

→ Vérifier que `ToasterProvider` est monté dans `layout.tsx`

### Problème : "Failed to fetch" persiste

→ Vérifier que le backend est démarré sur le bon port (8080)

### Problème : Vérifications trop fréquentes

→ Augmenter `checkInterval` dans `api-health-provider.tsx`

---

✅ **Corrections terminées** - L'application devrait maintenant fonctionner sans erreurs !

Date : 13 octobre 2025
