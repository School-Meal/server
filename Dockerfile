FROM alpine AS alpine-nodejs

RUN apk add --no-cache nodejs

# --

FROM alpine-nodejs AS alpine-pnpm

RUN apk add npm

RUN npm i -g pnpm

# --

FROM alpine-pnpm AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml /app/

RUN pnpm i

COPY tsconfig.json /app/

COPY src /app/src/

RUN pnpm run build

# --

FROM alpine-pnpm AS dependencies

WORKDIR /app

COPY package.json pnpm-lock.yaml /app/

RUN pnpm i -P

# --

FROM alpine-nodejs AS runtime

WORKDIR /app

COPY --from=dependencies /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist

ENTRYPOINT ["node", "dist/main.js"]