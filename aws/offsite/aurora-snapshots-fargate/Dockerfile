FROM node:20

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . .

ENTRYPOINT node ./restore-and-verify-backup.js
