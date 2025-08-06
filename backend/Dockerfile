FROM node:20-slim
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh

EXPOSE 3001
CMD ["./entrypoint.sh"]