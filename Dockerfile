# ベースとなるNode.js環境を指定
FROM node:20-alpine

# コンテナ内の作業ディレクトリを設定
WORKDIR /app

# 依存関係のファイルを先にコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# プロジェクトの全ファイルをコピー
COPY . .

# Next.jsが使用するポート3000を開放
EXPOSE 3000

# 開発サーバーを起動するコマンド
CMD ["npm", "run", "dev"]