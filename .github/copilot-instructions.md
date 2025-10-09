# Instructions Copilot - Badddy

## Architecture du Projet

Ce projet est un **monorepo fullstack** avec une séparation claire entre frontend et backend :

- **`/frontend`** : Application Next.js 15.5+ avec React 19, TailwindCSS 4.1+, et Turbopack
- **`/backend`** : API NestJS 11+ avec TypeScript, structure modulaire standard

### Points d'Intégration Clés

- **Ports par défaut** : Backend sur `:3000`, Frontend sur le port Next.js par défaut
- **Package manager** : Utilise `pnpm` exclusivement dans les deux projets
- **TypeScript strict** : Configuration stricte activée avec decorators expérimentaux (backend)

## Workflows de Développement

### Commandes Essentielles

```bash
# Backend (depuis /backend)
pnpm start:dev          # Mode développement avec watch
pnpm test:e2e           # Tests end-to-end
pnpm run lint --fix     # Auto-fix ESLint

# Frontend (depuis /frontend)
pnpm dev --turbopack     # Dev server avec Turbopack (plus rapide)
pnpm build --turbopack   # Build optimisé avec Turbopack
```

### Structure de Développement

- **Backend** : Suit l'architecture NestJS standard (`controllers`, `services`, `modules`)
- **Frontend** : Utilise Next.js App Router (`/src/app/`) avec alias `@/*` vers `./src/*`

## Conventions Spécifiques du Projet

### Styling & UI

- **TailwindCSS 4.1+** avec PostCSS - pas de fichier config Tailwind séparé
- Utilise les classes Tailwind modernes et la syntaxe `dark:` pour le mode sombre
- Police principale : Geist (via `next/font`)

### Configuration TypeScript

- **Backend** : `nodenext` module resolution, decorators activés
- **Frontend** : `bundler` module resolution, JSX preserve, paths alias configuré

### Tests & Qualité

- **Backend** : Jest avec support e2e, coverage configuré
- **ESLint** : Configuration flat config moderne (`.mjs`)

## Points Critiques pour l'IA

1. **Toujours utiliser `pnpm`** - jamais npm/yarn
2. **Backend sur port 3000** - vérifier les conflits de ports
3. **Turbopack activé** - utiliser `--turbopack` pour dev et build
4. **Module ESNext** - les deux projets utilisent des imports ES modules
5. **Path alias** : Utiliser `@/` pour les imports frontend

### Structure des Fichiers

- Nouveaux composants : `/frontend/src/components/`
- Nouvelles routes API : `/backend/src/` (suivre pattern NestJS)
- Types partagés : considérer un package workspace séparé si nécessaire
