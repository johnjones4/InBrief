FROM node:carbon

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

WORKDIR /usr/src/app/server
RUN npm install

WORKDIR /usr/src/app/client
RUN npm install
RUN npm run build

WORKDIR /usr/src/app/server

CMD ["node", "index.js"]
