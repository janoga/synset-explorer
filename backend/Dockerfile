FROM node:22-alpine

RUN apk add --no-cache tini

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json* ./
COPY .npmrc* ./

# Copy shared package
COPY shared/package.json ./shared/
COPY shared/tsconfig.json ./shared/
COPY shared/src ./shared/src

# Copy backend package
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma
COPY backend/prisma.config.ts ./backend/
COPY backend/tsconfig.json ./backend/

# Copy base tsconfig
COPY tsconfig.json ./

# Install all workspace dependencies
RUN npm ci

# Build shared package
RUN npm run -w shared build

# Copy backend source
COPY backend/src ./backend/src

WORKDIR /app/backend

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "dev"]
