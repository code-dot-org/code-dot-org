#!/bin/bash

# 'npm test' normally does all three of these things.
# We break them up here to support more granular retries.
npm run lint && \
for i in 1 2; do node --max_old_space_size=4096 `npm bin`/grunt unitTest && break; done && \
for i in 1 2; do node --max_old_space_size=4096 `npm bin`/grunt integrationTest && break; done

if [ -z "$CIRCLECI" ]; then
    echo "Uploading coverage reports in"
    ls coverage
    ./node_modules/.bin/codecov
fi
