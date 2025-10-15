# ----------------------------- # STAGE 1 : Build # ----------------------------- 
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
WORKDIR /app 
RUN pnpm --filter web install --frozen-lockfile 
# 
RUN ls -la ../ && sleep 90 
RUN pnpm --filter web run deploy-build 
# ----------------------------- # STAGE 2 : Run # ----------------------------- 
FROM builder AS runner 
WORKDIR /app/apps/web 
ENV NODE_ENV=production 
ENV PORT=3000 
EXPOSE 3000 
CMD ["pnpm", "start"]
