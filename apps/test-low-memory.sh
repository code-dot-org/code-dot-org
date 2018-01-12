#!/bin/bash
set -e

# 'npm test' normally does all three of these things.
# We break them up here so they each run in isolation.

GRUNT_CMD="node --max_old_space_size=4096 `npm bin`/grunt"

if [ -n "$CIRCLECI" ]; then
  mkdir -p log
  echo "See apps-test-log under the artifacts tab on circle for test output"

  curl -s https://codecov.io/bash > codecov.sh
  chmod +x codecov.sh

  $GRUNT_CMD preconcat concat

  SHELL=/bin/bash parallel -j 4 --joblog - ::: "npm run lint" \
  "($GRUNT_CMD unitTest && ./codecov.sh -cF unit) > log/unitTest.log" \
  "($GRUNT_CMD storybookTest && ./codecov.sh -cF storybook) > log/storybookTest.log" \
  "($GRUNT_CMD scratchTest && ./codecov.sh -cF scratch) > log/scratchTest.log" \
  "(LEVEL_TYPE='turtle' $GRUNT_CMD karma:integration && \
    ./codecov.sh -cF integration) > log/turtleTest.log" \
  "(LEVEL_TYPE='maze|bounce|calc|eval|flappy|studio' $GRUNT_CMD karma:integration && \
    ./codecov.sh -cF integration) > log/integrationTest.log" \
  "(LEVEL_TYPE='applab|gamelab' $GRUNT_CMD karma:integration && \
    ./codecov.sh -cF integration) > log/appLabgameLabTest.log" \
  "(LEVEL_TYPE='craft' $GRUNT_CMD karma:integration && \
    ./codecov.sh -cF integration) > log/craftTest.log"
else
  npm run lint
  $GRUNT_CMD unitTest
  $GRUNT_CMD storybookTest
  $GRUNT_CMD scratchTest
  LEVEL_TYPE='turtle' $GRUNT_CMD integrationTest
  LEVEL_TYPE='maze|bounce|calc|eval|flappy|studio' $GRUNT_CMD integrationTest
  LEVEL_TYPE='applab|gamelab' $GRUNT_CMD integrationTest
  LEVEL_TYPE='craft' $GRUNT_CMD integrationTest
fi
