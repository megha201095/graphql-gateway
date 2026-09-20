FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start"]
