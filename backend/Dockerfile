# --- Build stage ---
FROM node:24-alpine AS builder
WORKDIR /app
# better-sqlite3 has native bindings — these build tools let npm compile them
# from source on alpine/musl if no prebuilt binary matches this Node version.
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev

# --- Runtime stage ---
FROM node:24-alpine
RUN apk add --no-cache tini
WORKDIR /app

# Run as non-root user
RUN addgroup -S skyvault && adduser -S skyvault -G skyvault

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/data /app/logs && chown -R skyvault:skyvault /app

USER skyvault

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]
