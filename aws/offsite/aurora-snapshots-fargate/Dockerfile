FROM ubuntu:20.04

RUN apt-get update && \
    apt-get install -y \
        nodejs \
        npm

COPY . /root
WORKDIR /root
RUN npm install
ENTRYPOINT node /root/restore-and-verify-backup.js

