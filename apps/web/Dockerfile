# STAGE 1 : build
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

COPY . .
# build only the web package
RUN pnpm --filter web install --frozen-lockfile
WORKDIR /app/apps/web
RUN pnpm run deploy-build

# STAGE 2 : runner (production)
FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app/apps/web
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Copy only what's needed from builder
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json
# If you need node_modules for production start, install only prod deps
RUN pnpm install --prod --frozen-lockfile

CMD ["pnpm", "start"]
