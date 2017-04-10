#!/bin/bash

# 'npm test' normally does all three of these things.
# We break them up here to support more granular retries.
npm run lint && \
for i in 1 2; do node --max_old_space_size=4096 `npm bin`/grunt unitTest && break; done && \
if [ -n "$CIRCLECI" ]; then \
    bash <(curl -s https://codecov.io/bash) -cF unit; \
fi && \
for i in 1 2; do node --max_old_space_size=4096 `npm bin`/grunt storybookTest && break; done && \
if [-n "$CIRCLECI" ]; then \
    bash <(curl -s https://codecov.io/bash) -cF storybook; \
fi && \
for i in 1 2; do node --max_old_space_size=4096 `npm bin`/grunt integrationTest && break; done && \
if [ -n "$CIRCLECI" ]; then \
    bash <(curl -s https://codecov.io/bash) -cF integration; \
fi
