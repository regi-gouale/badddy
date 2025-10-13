# -----------------------------
# STAGE 1 : Build
# -----------------------------
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copier la config monorepo
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./

# Copier tous les packages nécessaires pour le build
COPY packages ./packages
COPY apps/web/package.json ./apps/web/

# Installer toutes les dépendances du workspace
RUN pnpm install --frozen-lockfile

# Copier le reste du code
COPY . .


# Builder le frontend
WORKDIR /app/apps/web
RUN pnpm install --frozen-lockfile
# RUN ls -la ../ && sleep 90
RUN pnpm run deploy-build

# -----------------------------
# STAGE 2 : Run
# -----------------------------
FROM builder AS runner
RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

RUN pnpm install --prod --filter ./apps/web...

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "start"]
