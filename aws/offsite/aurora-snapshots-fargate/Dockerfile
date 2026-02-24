FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates

# install node, based on instructions at https://github.com/nodesource/distributions#using-ubuntu-1
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs && \
    npm install -g corepack && \
    corepack enable

COPY . /root
WORKDIR /root
RUN npm install
ENTRYPOINT ["node", "/root/restore-and-verify-backup.js"]
