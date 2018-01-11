#!/bin/bash

# 'npm test' normally does all three of these things.
# We break them up here so they each run in isolation.

if [ -n "$CIRCLECI" ]; then
  mkdir -p log
  echo "Logging output to apps/log/ directory, see apps-test-log under the artifacts tab on circle"
  node --max_old_space_size=4096 `npm bin`/grunt preconcat concat && \
  SHELL=/bin/bash parallel -j 4 --joblog - ::: "npm run lint" \
  "(node --max_old_space_size=4096 `npm bin`/grunt unitTest && \
  bash <(curl -s https://codecov.io/bash) -cF unit) > log/unitTest.log" \
  "(node --max_old_space_size=4096 `npm bin`/grunt storybookTest && \
  bash <(curl -s https://codecov.io/bash) -cF storybook) > log/storybookTest.log" \
  "(node --max_old_space_size=4096 `npm bin`/grunt scratchTest && \
  bash <(curl -s https://codecov.io/bash) -cF scratch) > log/scratchTest.log" \
  "(LEVEL_TYPE='turtle' node --max_old_space_size=4096 `npm bin`/grunt karma:integration && \
  bash <(curl -s https://codecov.io/bash) -cF integration) > log/turtleTest.log" \
  "(LEVEL_TYPE='maze|bounce|calc|eval|flappy|studio' node --max_old_space_size=4096 `npm bin`/grunt karma:integration && \
  bash <(curl -s https://codecov.io/bash) -cF integration) > log/integrationTest.log" \
  "(LEVEL_TYPE='applab|gamelab' node --max_old_space_size=4096 `npm bin`/grunt karma:integration && \
  bash <(curl -s https://codecov.io/bash) -cF integration) > log/appLabgameLabTest.log" \
  "(LEVEL_TYPE='craft' node --max_old_space_size=4096 `npm bin`/grunt karma:integration && \
  bash <(curl -s https://codecov.io/bash) -cF integration) > log/craftTest.log"
else
  npm run lint && \
  node --max_old_space_size=4096 `npm bin`/grunt unitTest && \
  node --max_old_space_size=4096 `npm bin`/grunt storybookTest && \
  node --max_old_space_size=4096 `npm bin`/grunt scratchTest && \
  LEVEL_TYPE='turtle' node --max_old_space_size=4096 `npm bin`/grunt integrationTest && \
  LEVEL_TYPE='maze|bounce|calc|eval|flappy|studio' node --max_old_space_size=4096 `npm bin`/grunt integrationTest && \
  LEVEL_TYPE='applab|gamelab' node --max_old_space_size=4096 `npm bin`/grunt integrationTest && \
  LEVEL_TYPE='craft' node --max_old_space_size=4096 `npm bin`/grunt integrationTest
fi
