# ==========================================
# STAGE 1: Build & Compile Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with exact lockfile
COPY package*.json ./
RUN npm ci

# Copy full application source code
COPY . .

# Compile TypeScript & production Vite client bundle
RUN npm run build

# ==========================================
# STAGE 2: Production Execution Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Security hardening: run container as non-root user
USER node

# Copy compiled bundles and dependency manifests
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/server.ts ./server.ts

EXPOSE 3000

# Health check to ensure zero-downtime rolling updates
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "--loader", "tsx", "server.ts"]
