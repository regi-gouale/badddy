# Badddy - Turborepo Monorepo

Full-stack application with NestJS backend and Next.js frontend, featuring JWT authentication with Better Auth.

## 📋 Architecture

This monorepo contains:

### Apps

- **`apps/backend`** - NestJS REST API (port 8080)
  - Global prefix: `/api/v1`
  - JWT authentication via Better Auth JWKS
  - Prisma ORM for database
  - Dockerized for production

- **`apps/web`** - Next.js 15 App Router (port 3000)
  - Better Auth with JWT plugin
  - Parallel routes: `(marketing)`, `(auth)`, `(app)`
  - Prisma ORM for database
  - Tailwind CSS + shadcn/ui components

### Packages

- **`@repo/eslint-config`** - Shared ESLint configurations
- **`@repo/typescript-config`** - Shared TypeScript configurations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp apps/web/.env.example apps/web/.env
cp apps/backend/.env.example apps/backend/.env

# Configure database URLs in .env files
```

### Development

```bash
# Run both apps in dev mode
pnpm dev

# Run only frontend
pnpm --filter web dev

# Run only backend
pnpm --filter backend dev
```

### Building

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter web build
pnpm --filter backend build
```

### Testing

```bash
# Run all tests
pnpm test

# Backend tests
pnpm --filter backend test
pnpm --filter backend test:e2e

# Frontend tests (if configured)
pnpm --filter web test
```

## 🔐 Authentication

### Architecture

- **Frontend**: Better Auth with JWT plugin (Next.js)
- **Backend**: JWT validation via JWKS public keys (NestJS)
- **No auth library in backend** - only token verification

### How it works

1. User authenticates on frontend (Better Auth)
2. Frontend gets JWT token from `/api/auth/token`
3. Frontend sends JWT in `Authorization: Bearer <token>` header
4. Backend fetches public keys from `http://localhost:3000/api/auth/jwks`
5. Backend verifies JWT signature using JWKS
6. Request proceeds if valid, returns 401 if invalid

### Documentation

- **Backend Authentication**: `apps/backend/AUTHENTICATION.md`
- **Frontend API Usage**: `apps/web/BACKEND_API_USAGE.md`

### Protected Routes

All `/api/v1/*` routes are protected by default. To make a route public:

```typescript
@Public() // Add this decorator
@Get('/health')
getHealth() {
  return { status: 'ok' };
}
```

### Making API Calls from Frontend

```typescript
import { backendApiClient } from "@/lib/backend-api-client";

// Automatic JWT authentication
const { data, error } = await backendApiClient.get("/api/v1/users/me");
```

See `apps/web/BACKEND_API_USAGE.md` for complete guide.

## 📦 Project Structure

```
badddy/
├── apps/
│   ├── backend/              # NestJS API
│   │   ├── src/
│   │   │   ├── guards/       # JWT auth guard
│   │   │   ├── decorators/   # @Public(), @CurrentUser()
│   │   │   ├── controllers/  # API endpoints
│   │   │   └── prisma/       # Database module
│   │   ├── prisma/           # Database schema & migrations
│   │   └── test/             # Unit & E2E tests
│   │
│   └── web/                  # Next.js frontend
│       ├── app/              # App Router
│       │   ├── (marketing)/  # Public pages
│       │   ├── (auth)/       # Login/register
│       │   └── (app)/        # Protected dashboard
│       ├── components/       # UI components
│       ├── lib/              # Auth config & API client
│       ├── hooks/            # React hooks
│       └── prisma/           # Database schema
│
├── packages/
│   ├── eslint-config/        # Shared ESLint configs
│   └── typescript-config/    # Shared TS configs
│
├── turbo.json                # Turborepo config
├── pnpm-workspace.yaml       # PNPM workspaces
└── docker-compose.yml        # Docker setup
```

## 🛠️ Key Technologies

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Backend**: NestJS, Express, Prisma, PostgreSQL
- **Frontend**: Next.js 15, React, Tailwind CSS
- **Auth**: Better Auth (JWT plugin)
- **JWT Validation**: jose library
- **Testing**: Jest
- **Linting**: ESLint, Prettier
- **Type Safety**: TypeScript

## 🔧 Environment Variables

### Backend (`apps/backend/.env`)

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_URL="http://localhost:3000"
PORT=8080
```

### Frontend (`apps/web/.env`)

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
BACKEND_INTERNAL_URL="http://localhost:8080"
NEXT_PUBLIC_BACKEND_URL="http://localhost:8080"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# OAuth providers (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 🐳 Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Backend: http://localhost:4000
# Frontend: http://localhost:3000
```

## 📝 Scripts

### Root Level

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm test         # Run all tests
pnpm lint         # Lint all code
pnpm check-types  # Type check all code
```

### Backend Specific

```bash
pnpm --filter backend dev              # Dev mode
pnpm --filter backend build            # Production build
pnpm --filter backend deploy-build     # Build with Prisma
pnpm --filter backend test             # Unit tests
pnpm --filter backend test:e2e         # E2E tests
pnpm --filter backend prisma:migrate   # Run migrations
pnpm --filter backend prisma:studio    # Open Prisma Studio
```

### Frontend Specific

```bash
pnpm --filter web dev              # Dev mode
pnpm --filter web build            # Production build
pnpm --filter web deploy-build     # Build with Prisma
pnpm --filter web prisma:migrate   # Run migrations
pnpm --filter web prisma:studio    # Open Prisma Studio
```

## 🧪 Testing

## 🧪 Testing

### Backend Tests

```bash
# Unit tests
pnpm --filter backend test

# E2E tests (test HTTP endpoints)
pnpm --filter backend test:e2e

# Coverage
pnpm --filter backend test:cov
```

The E2E tests verify that:

- Protected routes return 401 without authentication
- Public routes (with `@Public()`) work without auth
- JWT validation works correctly

### Testing Authentication Flow

1. Start both apps:

   ```bash
   pnpm dev
   ```

2. Visit `http://localhost:3000/register` and create an account

3. Try calling the backend:

   ```typescript
   const { data } = await backendApiClient.getCurrentUser();
   console.log(data); // Should return user info
   ```

4. Log out and try again - should get 401 error

## 📚 API Documentation

### Backend Endpoints

#### Protected Endpoints (require JWT)

- `GET /api/v1/` - Health check (protected by default)
- `GET /api/v1/users/me` - Get current user profile

#### Adding New Endpoints

```typescript
import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "@/decorators/current-user.decorator";

@Controller("posts")
export class PostsController {
  // Protected endpoint
  @Get()
  getPosts(@CurrentUser() user) {
    // user.id, user.email, user.name are available
    return this.postsService.findByUser(user.id);
  }

  // Public endpoint
  @Public()
  @Get("trending")
  getTrending() {
    return this.postsService.findTrending();
  }
}
```

## 🚢 Deployment

### Backend Deployment

The backend Dockerfile is optimized for production:

```bash
# Build
docker build -f apps/backend/Dockerfile -t badddy-backend .

# Run
docker run -p 4000:4000 -e DATABASE_URL="..." badddy-backend
```

### Frontend Deployment

The frontend can be deployed to Vercel, Netlify, or Docker:

```bash
# Build
docker build -f apps/web/Dockerfile -t badddy-web .

# Run
docker run -p 3000:3000 -e DATABASE_URL="..." badddy-web
```

### Environment Variables in Production

Make sure to set these in your deployment platform:

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Random secret for JWT signing
- `BETTER_AUTH_URL` - Your production domain
- `BACKEND_INTERNAL_URL` - Internal backend URL (if in same network)
- `NEXT_PUBLIC_BACKEND_URL` - Public backend URL

## 🔍 Troubleshooting

### "No authentication token available"

- Make sure you're logged in on the frontend
- Check that Better Auth JWT plugin is enabled
- Verify `authClient.token.get()` returns a token

### Backend returns 401 even when logged in

- Check `BETTER_AUTH_URL` is correct in backend `.env`
- Verify JWKS endpoint is accessible: `curl http://localhost:3000/api/auth/jwks`
- Check browser console for token errors

### CORS errors

- Backend CORS is enabled by default
- If using different domains, update `origin` in `main.ts`

### Database connection errors

- Verify `DATABASE_URL` is correct
- Run migrations: `pnpm --filter [app] prisma:migrate`
- Check PostgreSQL is running

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Run tests: `pnpm test`
4. Run linting: `pnpm lint`
5. Type check: `pnpm check-types`
6. Submit PR

## 📄 License

This project is private and proprietary.

## 📞 Support

For questions or issues, please contact the development team.

---

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
