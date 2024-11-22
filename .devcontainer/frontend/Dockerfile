# Experimental Code.org Frontend Dev Container. Not officially supported at this time.

# syntax=docker.io/docker/dockerfile:1

# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 18, 16, 14, 18-bullseye, 16-bullseye, 14-bullseye, 18-buster, 16-buster, 14-buster
ARG VARIANT=1-22-bookworm
FROM mcr.microsoft.com/devcontainers/typescript-node:${VARIANT}

# Install additional OS packages.
# These are required to run playwright properly
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
     && apt-get -y install --no-install-recommends \
     xdg-utils git-lfs

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"

# Enable yarn
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable yarn && \
    yarn set version berry

# Install Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright
RUN yarn dlx playwright install --with-deps