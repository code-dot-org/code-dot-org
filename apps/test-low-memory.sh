#!/bin/bash

# 'npm test' normally does all three of these things.
# We break them up here to support more granular retries.
npm run lint && \
for i in 1 2; do npm run test:unit && break; done && \
for i in 1 2; do npm run test:integration && break; done
