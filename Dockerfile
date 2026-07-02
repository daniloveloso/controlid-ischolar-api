FROM node:20-alpine

# ===== Dependências do sistema =====
# openssl + libc (Prisma)
# tzdata (timezone Brasil)
# dcron (cron)
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    tzdata \
    # dcron \
    bash

# Timezone Brasil
ENV TZ=America/Sao_Paulo

WORKDIR /app

# ===== Dependências Node =====
COPY package*.json ./
RUN npm install

# ===== Prisma =====
COPY prisma ./prisma
RUN npx prisma generate

# ===== Código =====
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ===== Cron =====
# Copia o arquivo de cron
COPY crontab /etc/crontabs/root

# Garante permissão correta
RUN chmod 0644 /etc/crontabs/root

# ===== Porta =====
EXPOSE 3000

# ===== Start =====
# Sobe cron + API
# CMD ["sh", "-c", "crond && node dist/server.js"]
CMD ["node", "dist/server.js"] 