FROM node:20-slim

# OpenSSLをインストール（Prisma用）
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh

EXPOSE 3001
CMD ["./entrypoint.sh"]