#!/bin/bash
set -e

# 'npm test' normally does all three of these things.
# We break them up here so they each run in isolation.

alias grunt="node --max_old_space_size=4096 `npm bin`/grunt"

if [ -n "$CIRCLECI" ]; then
  mkdir -p log
  echo "See apps-test-log under the artifacts tab on circle for test output"

  curl -s https://codecov.io/bash > codecov.sh
  chmod +x codecov.sh

  grunt preconcat concat

  SHELL=/bin/bash parallel -j 4 --joblog - ::: "npm run lint" \
  "(grunt unitTest && ./codecov.sh -cF unit) > log/unitTest.log" \
  "(grunt storybookTest && ./codecov.sh -cF storybook) > log/storybookTest.log" \
  "(grunt scratchTest && ./codecov.sh -cF scratch) > log/scratchTest.log" \
  "(LEVEL_TYPE='turtle' grunt karma:integration && \
    ./codecov.sh -cF integration) > log/turtleTest.log" \
  "(LEVEL_TYPE='maze|bounce|calc|eval|flappy|studio' grunt karma:integration && \
    ./codecov.sh -cF integration) > log/integrationTest.log" \
  "(LEVEL_TYPE='applab|gamelab' grunt karma:integration && \
    ./codecov.sh -cF integration) > log/appLabgameLabTest.log" \
  "(LEVEL_TYPE='craft' grunt karma:integration && \
    ./codecov.sh -cF integration) > log/craftTest.log"
else
  npm run lint
  grunt unitTest
  grunt storybookTest
  grunt scratchTest
  LEVEL_TYPE='turtle' grunt integrationTest
  LEVEL_TYPE='maze|bounce|calc|eval|flappy|studio' grunt integrationTest
  LEVEL_TYPE='applab|gamelab' grunt integrationTest
  LEVEL_TYPE='craft' grunt integrationTest
fi
