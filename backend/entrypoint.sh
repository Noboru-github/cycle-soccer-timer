#!/bin/sh

# データベースのスキーマを強制的に同期し、Prisma Clientを生成する
# このコマンドは対話的な質問をしないため、スクリプト内で安全に実行できる
npx prisma db push

# 開発サーバーを起動する
echo "Starting development server..."
exec npm run dev