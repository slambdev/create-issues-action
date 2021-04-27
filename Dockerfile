FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN ls

CMD ["node", "main.js"]
