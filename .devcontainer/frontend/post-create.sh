#!/bin/bash

set -x

cd frontend && \
    yarn install

cd apps/design-system-storybook && \
    npx puppeteer browsers install chrome && \
    npx puppeteer browsers install firefox