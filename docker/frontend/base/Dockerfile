# Code.org frontend-base Docker image
# Not for public usage outside Code.org applications
FROM ubuntu:24.04
LABEL maintainer="Code.org Engineering"
LABEL description="Base image for Code.org Next.js frontend applications. Not supported for external use."

# If changing yarn versions, also update the version in frontend/package.json
ENV YARN_VERSION=4.6.0
# If changing Node.js versions, also update the version in frontend/.nvmrc
ENV NODE_VERSION=20

# If performing a Yarn upgrades, refer to frontend/package.json to the locked yarn version
# The apt-get clean and removal of /var/lib/apt/lists is to reduce image size.
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash - && \
    apt-get install -y nodejs && \
    corepack enable && \
    corepack prepare yarn@$YARN_VERSION --activate && \
    yarn --version && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set default shell
SHELL ["/bin/bash", "-c"]
