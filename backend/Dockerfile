# Production Multi-Stage Dockerfile for CampusLedger Backend
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app /app

EXPOSE 5000
CMD ["node", "server.js"]
