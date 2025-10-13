# -----------------------------
# STAGE 1 : Build
# -----------------------------
FROM node:20-alpine AS builder

# Installer pnpm globalement
RUN npm install -g pnpm

WORKDIR /app

# Copier les fichiers de config
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./
COPY apps/backend/package.json apps/backend/

# Installer uniquement les dépendances nécessaires au backend
RUN pnpm i

# Copier le reste du code
COPY . .

# Build du backend NestJS
WORKDIR /app/apps/backend
RUN pnpm install --frozen-lockfile
RUN pnpm run deploy-build

# -----------------------------
# STAGE 2 : Run
# -----------------------------
FROM node:20-alpine AS runner

RUN npm install -g pnpm

WORKDIR /app

# Copier uniquement ce qui est nécessaire
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Installer uniquement les dépendances de prod
RUN pnpm i

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/main.js"]
