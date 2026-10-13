FROM node:22.23.1-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json nuxt.config.ts ./
COPY app/assets/css ./app/assets/css
# Keep installation independent of Railway's service-specific cache IDs.
RUN npm ci
COPY . .
ENV NITRO_PRESET=node-server
RUN npm run typecheck && npm run build

FROM node:22.23.1-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NITRO_HOST=0.0.0.0 SQLITE_PATH=/data/paywall.sqlite PORT=3000
COPY --from=build /app/.output ./.output
RUN mkdir -p /data && node -e "const D=require('./.output/server/node_modules/better-sqlite3'); const d=new D(':memory:'); d.prepare('SELECT 1').get(); d.close()"
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
