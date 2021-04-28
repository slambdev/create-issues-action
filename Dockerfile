FROM node:14-alpine

WORKDIR /github/workspace/

COPY . .

RUN npm ci --only=production

RUN ls

ENTRYPOINT ["node", "./main.js"]
