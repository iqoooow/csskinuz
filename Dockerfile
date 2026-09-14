# =====================================================================
# CSSKINUZ PRODUCTION DOCKERFILE (MULTI-STAGE BUILD)
# =====================================================================

# 1-Bosqich: Build qilish
FROM node:22-alpine AS builder
WORKDIR /app

# Bog'liqliklarni nusxalash va o'rnatish
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

RUN npm install

# Barcha kodlarni nusxalash
COPY . .

# Build qilish
RUN npm run build

# 2-Bosqich: Ishlab chiqarish runtime
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV WS_PORT=4000

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

RUN npm install --omit=dev

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/supabase ./supabase
COPY --from=builder /app/docs ./docs

EXPOSE 4000 3000

CMD ["node", "apps/api/dist/index.js"]
