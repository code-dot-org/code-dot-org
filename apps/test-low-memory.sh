#!/bin/bash

# 'npm test' normally does all three of these things.
# We break them up here so they each run in isolation.

#npm run lint && \
#
#node --max_old_space_size=4096 `npm bin`/grunt unitTest && \
#if [ -n "$CIRCLECI" ]; then \
#    bash <(curl -s https://codecov.io/bash) -cF unit; \
#fi && \
#
#node --max_old_space_size=4096 `npm bin`/grunt storybookTest && \
#if [ -n "$CIRCLECI" ]; then \
#    bash <(curl -s https://codecov.io/bash) -cF storybook; \
#fi && \
#
#node --max_old_space_size=4096 `npm bin`/grunt scratchTest && \
#if [ -n "$CIRCLECI" ]; then \
#    bash <(curl -s https://codecov.io/bash) -cF scratch; \
#fi && \

LEVEL_TYPE='maze|turtle|bounce|calc|eval|flappy|studio' node --max_old_space_size=4096 `npm bin`/grunt integrationTest && \
if [ -n "$CIRCLECI" ]; then \
    bash <(curl -s https://codecov.io/bash) -cF integration; \
fi
#fi && \
#
#LEVEL_TYPE='applab|gamelab' node --max_old_space_size=4096 `npm bin`/grunt integrationTest && \
#if [ -n "$CIRCLECI" ]; then \
#    bash <(curl -s https://codecov.io/bash) -cF integration; \
#fi && \
#
#LEVEL_TYPE='craft' node --max_old_space_size=4096 `npm bin`/grunt integrationTest && \
#if [ -n "$CIRCLECI" ]; then \
#    bash <(curl -s https://codecov.io/bash) -cF integration; \
#fi
