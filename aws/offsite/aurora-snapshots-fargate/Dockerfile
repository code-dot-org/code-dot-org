FROM ubuntu:24.04

RUN apt-get update && apt-get install -y curl ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

COPY . /root
WORKDIR /root
RUN npm ci --only=production

ENTRYPOINT ["node", "/root/restore-and-verify-backup.js"]
