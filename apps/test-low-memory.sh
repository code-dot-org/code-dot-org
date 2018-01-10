#!/bin/bash

# 'npm test' normally does all three of these things.
# We break them up here so they each run in isolation.

#if [ -n "$CIRCLECI" ]; then
node --max_old_space_size=4096 `npm bin`/grunt preconcat concat && \
SHELL=/bin/bash parallel -j 4 ::: "npm run lint" \
"node --max_old_space_size=4096 `npm bin`/grunt unitTest && \
echo bash <(curl -s https://codecov.io/bash) -cF unit" \
"echo hi"\
"node --max_old_space_size=4096 `npm bin`/grunt storybookTest && \
echo bash <(curl -s https://codecov.io/bash) -cF storybook" \
"node --max_old_space_size=4096 `npm bin`/grunt scratchTest && \
echo bash <(curl -s https://codecov.io/bash) -cF scratch" \
"LEVEL_TYPE='turtle' node --max_old_space_size=4096 `npm bin`/grunt karma:integration && \
echo bash <(curl -s https://codecov.io/bash) -cF integration" \
"LEVEL_TYPE='maze|bounce|calc|eval|flappy|studio' node --max_old_space_size=4096 `npm bin`/grunt karma:integration && \
echo bash <(curl -s https://codecov.io/bash) -cF integration" \
"LEVEL_TYPE='applab|gamelab' node --max_old_space_size=4096 `npm bin`/grunt karma:integration && \
echo bash <(curl -s https://codecov.io/bash) -cF integration" \
"LEVEL_TYPE='craft' node --max_old_space_size=4096 `npm bin`/grunt karma:integration && \
echo bash <(curl -s https://codecov.io/bash) -cF integration"
#else
#  npm run lint && \
#
#  node --max_old_space_size=4096 `npm bin`/grunt unitTest && \
#
#  node --max_old_space_size=4096 `npm bin`/grunt storybookTest && \
#
#  node --max_old_space_size=4096 `npm bin`/grunt scratchTest && \
#
#  LEVEL_TYPE='turtle' node --max_old_space_size=4096 `npm bin`/grunt integrationTest && \
#
#  LEVEL_TYPE='maze|bounce|calc|eval|flappy|studio' node --max_old_space_size=4096 `npm bin`/grunt integrationTest && \
#
#  LEVEL_TYPE='applab|gamelab' node --max_old_space_size=4096 `npm bin`/grunt integrationTest && \
#
#  LEVEL_TYPE='craft' node --max_old_space_size=4096 `npm bin`/grunt integrationTest
#fi
