FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app/apps/web
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json
# Copier node_modules si présents dans builder
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/web/node_modules /app/apps/web/node_modules

CMD ["pnpm", "start"]
