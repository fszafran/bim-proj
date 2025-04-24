FROM node:22-alpine

WORKDIR /app/frontend

ENV FRONTEND_PORT=${FRONTEND_PORT}

COPY package*.json .

RUN npm ci && npm cache clean --force

COPY . .

EXPOSE ${FRONTEND_PORT}

CMD ["npm", "run", "dev"]





