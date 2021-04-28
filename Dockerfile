FROM node:14-alpine

COPY . .

RUN npm ci --only=production

RUN ls

CMD ["npm", "start"]
