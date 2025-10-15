FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app/apps/web
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Copier artefacts de build
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json
# Copier lockfile racine requis par pnpm
COPY --from=builder /app/pnpm-lock.yaml ../pnpm-lock.yaml

# Installer les dépendances de production en s'appuyant sur le lockfile
WORKDIR /app
RUN pnpm install --prod --frozen-lockfile --filter ./apps/web...

WORKDIR /app/apps/web
CMD ["pnpm", "start"]
