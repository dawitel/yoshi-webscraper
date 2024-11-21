FROM node:18-alpine AS base

WORKDIR /app

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    bash \
    python3 \
    make \
    g++

COPY package.json pnpm-lock.yaml ./ 

RUN npm install -g pnpm && pnpm install --frozen-lockfile

RUN npx puppeteer browsers install chrome

COPY . .

RUN pnpm build

FROM node:18-alpine AS production

WORKDIR /app

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

COPY --from=base /app /app

EXPOSE 3000

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENV RESEND_API_KEY=re_eJ7UL2hq_FrfLq3Uc498J21VdyAV9bvrc
ENV SCRAPE_DOT_DO_API_TOKEN=1dfb7d786e984316befd2ca4c014e72439151076a05
ENV SCRAPE_DOT_DO_API_TOKEN_2=1dfb7d786e984316befd2ca4c014e72439151076a05

ENV NODE_ENV=production

CMD ["pnpm", "start"]
