FROM oven/bun:1-alpine

WORKDIR /app

COPY backend/package.json ./
RUN bun install --frozen-lockfile || bun install

COPY backend/ .
EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]