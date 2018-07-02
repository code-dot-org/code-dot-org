#!/bin/bash
set -e

# 'npm test' normally does all three of these things.
# We break them up here so they each run in isolation.
GRUNT_CMD="node --max_old_space_size=4096 `npm bin`/grunt"

if [ -n "$CIRCLECI" ]; then
  mkdir -p log

  curl -s https://codecov.io/bash > /tmp/codecov.sh
  chmod +x /tmp/codecov.sh

  $GRUNT_CMD preconcat concat

  echo "###################################################################"
  echo "#                                                                 #"
  echo "#   See 'apps-test-log' under the artifacts tab for test output   #"
  echo "#                                                                 #"
  echo "###################################################################"

  SHELL=/bin/bash parallel -j 4 --joblog - ::: "npm run lint" \
  "(PORT=9876 $GRUNT_CMD unitTest && /tmp/codecov.sh -cF unit) > log/unitTest.log" \
  "(PORT=9877 $GRUNT_CMD storybookTest && /tmp/codecov.sh -cF storybook) > log/storybookTest.log" \
  "(PORT=9878 $GRUNT_CMD scratchTest && /tmp/codecov.sh -cF scratch) > log/scratchTest.log" \
  "(PORT=9879 LEVEL_TYPE='turtle' $GRUNT_CMD karma:integration && \
    /tmp/codecov.sh -cF integration) > log/turtleTest.log" \
  "(PORT=9880 LEVEL_TYPE='maze|bounce|calc|eval|flappy|studio' $GRUNT_CMD karma:integration && \
    /tmp/codecov.sh -cF integration) > log/integrationTest.log" \
  "(PORT=9881 LEVEL_TYPE='applab|gamelab' $GRUNT_CMD karma:integration && \
    /tmp/codecov.sh -cF integration) > log/appLabgameLabTest.log" \
  "(PORT=9882 LEVEL_TYPE='craft' $GRUNT_CMD karma:integration && \
    /tmp/codecov.sh -cF integration) > log/craftTest.log"
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
