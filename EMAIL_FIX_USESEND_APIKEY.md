# 🔧 Correction - Erreur USESEND_APIKEY

## ❌ Problème rencontré

Lors du démarrage du backend, une erreur était levée :

```
[Nest] ERROR [EmailService] USESEND_APIKEY not found in environment variables
Error: USESEND_APIKEY is required
```

## 🔍 Cause du problème

Le service `EmailService` tentait de lire directement `process.env.USESEND_APIKEY` dans son constructeur, mais **NestJS ne charge pas automatiquement les fichiers `.env`** par défaut.

## ✅ Solution implémentée

### 1. Installation de @nestjs/config

```bash
pnpm --filter backend add @nestjs/config
```

Ce module permet de charger automatiquement les variables d'environnement depuis le fichier `.env`.

### 2. Configuration dans AppModule

**Fichier modifié** : `apps/backend/src/app.module.ts`

```typescript
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    // Configuration des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true, // Rend ConfigModule disponible partout
      envFilePath: ".env", // Chemin vers le fichier .env
    }),
    // ... autres imports
  ],
})
export class AppModule {}
```

**Option `isGlobal: true`** : Permet d'utiliser `ConfigService` dans tous les modules sans avoir à importer `ConfigModule` partout.

### 3. Mise à jour du EmailService

**Fichier modifié** : `apps/backend/src/modules/email/email.service.ts`

**Avant** :

```typescript
constructor() {
  const apiKey = process.env.USESEND_APIKEY; // ❌ Ne fonctionne pas
  // ...
}
```

**Après** :

```typescript
import { ConfigService } from '@nestjs/config';

constructor(private readonly configService: ConfigService) {
  const apiKey = this.configService.get<string>('USESEND_APIKEY'); // ✅
  // ...
}
```

### 4. Mise à jour des tests

**Fichier modifié** : `apps/backend/src/modules/email/email.service.spec.ts`

Les tests ont été mis à jour pour mocker `ConfigService` :

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    EmailService,
    {
      provide: ConfigService,
      useValue: {
        get: jest.fn((key: string) => {
          if (key === "USESEND_APIKEY") {
            return "us_test_key";
          }
          return null;
        }),
      },
    },
  ],
}).compile();
```

## ✅ Vérifications

### Tests unitaires

```bash
pnpm --filter backend test -- email.service.spec.ts
```

**Résultat** : ✅ 5 tests passent

### Compilation

```bash
pnpm --filter backend run build
```

**Résultat** : ✅ Compilation réussie

### Démarrage du serveur

```bash
pnpm --filter backend dev
```

**Résultat attendu** :

```
[Nest] LOG [EmailService] EmailService initialized successfully
[Nest] LOG [NestApplication] Nest application successfully started
```

## 📚 Bonnes pratiques

### ✅ Toujours utiliser ConfigService dans NestJS

**Avantages** :

- ✅ Chargement automatique du `.env`
- ✅ Type safety avec TypeScript
- ✅ Facilite les tests (mocking)
- ✅ Support des valeurs par défaut
- ✅ Validation des variables

**Exemple avec valeur par défaut** :

```typescript
const port = this.configService.get<number>("PORT", 3000);
```

### ✅ Configuration globale

En définissant `isGlobal: true` dans `ConfigModule.forRoot()`, vous n'avez pas besoin d'importer `ConfigModule` dans chaque module.

### ✅ Variables d'environnement requises

Le service vérifie maintenant correctement si la clé API est présente et lance une erreur claire si elle est manquante :

```typescript
if (!apiKey) {
  this.logger.error("USESEND_APIKEY not found in environment variables");
  throw new Error("USESEND_APIKEY is required");
}
```

## 📋 Fichiers modifiés

| Fichier                                                | Modification                                            |
| ------------------------------------------------------ | ------------------------------------------------------- |
| `apps/backend/package.json`                            | Ajout de `@nestjs/config`                               |
| `apps/backend/src/app.module.ts`                       | Import et configuration de `ConfigModule`               |
| `apps/backend/src/modules/email/email.service.ts`      | Utilisation de `ConfigService` au lieu de `process.env` |
| `apps/backend/src/modules/email/email.service.spec.ts` | Mock de `ConfigService` dans les tests                  |

## 🚀 Prochaines étapes

Le serveur devrait maintenant démarrer sans erreur. Vous pouvez :

1. Démarrer le backend : `pnpm --filter backend dev`
2. Vérifier les logs : vous devriez voir `EmailService initialized successfully`
3. Tester les endpoints email via Swagger : `http://localhost:8080/api`

## 🆘 En cas de problème

Si l'erreur persiste :

1. **Vérifier le fichier .env** : `apps/backend/.env` doit contenir :

   ```
   USESEND_APIKEY=us_k6pxfrxupn_f47d253b05e9a1cf5e95327587a5047f
   ```

2. **Redémarrer le serveur** : Ctrl+C puis relancer `pnpm --filter backend dev`

3. **Vérifier les logs** : Le message devrait être :
   ```
   [Nest] LOG [EmailService] EmailService initialized successfully
   ```

---

**Correction appliquée avec succès !** ✅
