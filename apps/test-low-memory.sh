#!/bin/bash
set -e

MEM_PER_PROCESS=4096
GRUNT_CMD="node --max_old_space_size=${MEM_PER_PROCESS} `npm bin`/grunt"

if [ -n "$CIRCLECI" ]; then
  NPROC=4
  mkdir -p log
  cat <<STR
###################################################################
#                                                                 #
#   See 'apps-test-log' under the artifacts tab for test output   #
#                                                                 #
###################################################################
STR
  CODECOV=/tmp/codecov.sh
  curl -s https://codecov.io/bash > ${CODECOV}
  chmod +x ${CODECOV}
  LOG=">"
else
  # For non-Circle runs, stub-out codecov and logging to files.
  NPROC=$(nproc)
  CODECOV=: # stub
  LOG='&& :' # stub
fi

# Don't run more processes than can fit in free memory.
MEM_PROCS=$(awk "/MemFree/ {printf \"%d\", \$2/1024/${MEM_PER_PROCESS}}" /proc/meminfo)
PROCS=$(( ${MEM_PROCS} < ${NPROC} ? ${MEM_PROCS} : ${NPROC} ))

if [ $PROCS -eq 0 ]; then
  FREE_KB=$(awk "/MemFree/ {printf \"%d\", \$2/1024}" /proc/meminfo)
  echo "Warning: There may not be enough free memory to run tests. Required: ${MEM_PER_PROCESS}KB; Free: ${FREE_KB}KB"
  PROCS=1
fi

$GRUNT_CMD preconcat

export SHELL=/bin/bash
if command -v parallel 2>/dev/null; then
  PARALLEL="parallel --will-cite --halt 2 -j ${PROCS} --joblog - :::"
else
  PARALLEL="xargs -P${PROCS} -d\n -L1 -n1 ${SHELL} -c"
fi

${PARALLEL} <<SCRIPT
npm run lint
(PORT=9876 ${GRUNT_CMD} unitTest && ${CODECOV} -cF unit) ${LOG} log/unitTest.log
(PORT=9877 $GRUNT_CMD storybookTest && ${CODECOV} -cF storybook) ${LOG} log/storybookTest.log
(PORT=9878 $GRUNT_CMD scratchTest && ${CODECOV} -cF scratch) ${LOG} log/scratchTest.log
(PORT=9879 LEVEL_TYPE='turtle' $GRUNT_CMD karma:integration && \
  ${CODECOV} -cF integration) ${LOG} log/turtleTest.log
(PORT=9880 LEVEL_TYPE='maze|bounce|calc|eval|flappy|studio' $GRUNT_CMD karma:integration && \
  ${CODECOV} -cF integration) ${LOG} log/integrationTest.log
(PORT=9881 LEVEL_TYPE='applab|gamelab' $GRUNT_CMD karma:integration && \
  ${CODECOV} -cF integration) ${LOG} log/appLabgameLabTest.log
(PORT=9882 LEVEL_TYPE='craft' $GRUNT_CMD karma:integration && \
  ${CODECOV} -cF integration) ${LOG} log/craftTest.log
SCRIPT
