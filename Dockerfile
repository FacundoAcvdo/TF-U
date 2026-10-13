FROM node:24-alpine

WORKDIR /app

EXPOSE 6001

ENV HOSTNAME="0.0.0.0"
ENV PORT=6001

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]