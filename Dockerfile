# ベースとなるNode.js環境を指定
FROM node:20-slim

# OpenSSLをインストール（Prisma用）
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# コンテナ内の作業ディレクトリを設定
WORKDIR /app

# 依存関係のファイルを先にコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# プロジェクトの全ファイルをコピー
COPY . .

# Prismaクライアントを生成
RUN npx prisma generate

# Next.jsが使用するポート3000を開放
EXPOSE 3000

# 開発サーバーを起動するコマンド
CMD ["npm", "run", "dev"]