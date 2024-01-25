FROM node:20

# Choosing this path for no reason other than convention.
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . .

ENTRYPOINT node ./restore-and-verify-backup.js
