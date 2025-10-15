# STAGE 1 : builder
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter web install --frozen-lockfile
WORKDIR /app/apps/web
RUN pnpm run deploy-build

# STAGE 2 : runner (production)
FROM node:20-alpine AS runner
RUN npm install -g pnpm
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app/apps/web
EXPOSE 3000

# Copier uniquement les artefacts nécessaires depuis la stage builder
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json
# Copier le lockfile racine pour permettre une install fiable si nécessaire
COPY --from=builder /app/pnpm-lock.yaml ../pnpm-lock.yaml

# Installer uniquement les dépendances de production (depuis la racine avec filter)
WORKDIR /app
RUN pnpm install --prod --frozen-lockfile --filter ./apps/web...

WORKDIR /app/apps/web
CMD ["pnpm", "start"]
