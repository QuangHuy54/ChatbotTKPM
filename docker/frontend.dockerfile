FROM node:21

WORKDIR /app

COPY yarn.lock package.json ./

RUN yarn config set network-timeout 600000

RUN yarn install

COPY . /app

ENV HOST 0.0.0.0

ENV PORT=3000

ENV CHOKIDAR_USEPOLLING=true

ENV BROWSER=none

EXPOSE 3000

CMD ["npm", "start"]