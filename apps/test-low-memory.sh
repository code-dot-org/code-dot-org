#!/bin/bash
set -e

NPROC=$(nproc)
MEM_PER_PROCESS=4096
GRUNT_CMD="node --max_old_space_size=${MEM_PER_PROCESS} `npm bin`/grunt"

if [ -n "$DRONE" ]; then
  CODECOV=/tmp/codecov.sh
  curl -s https://codecov.io/bash > ${CODECOV}
  chmod +x ${CODECOV}
  CODECOV="$CODECOV -C $DRONE_COMMIT_SHA"

  # Limit parallelism on Drone to reduce chances of PhantomJS crashes.
  NPROC=2
else
  # For non-Drone runs, stub-out codecov.
  CODECOV=: # stub
fi

# Use MemAvailable when available, otherwise fall back to MemFree
if grep -q MemAvailable /proc/meminfo; then
  MEM_METRIC=MemAvailable
else
  MEM_METRIC=MemFree
fi

# Don't run more processes than can fit in free memory.
MEM_PROCS=$(awk "/${MEM_METRIC}/ {printf \"%d\", \$2/1024/${MEM_PER_PROCESS}}" /proc/meminfo)
PROCS=$(( ${MEM_PROCS} < ${NPROC} ? ${MEM_PROCS} : ${NPROC} ))

if [ $PROCS -eq 0 ]; then
  FREE_KB=$(awk "/MemFree/ {printf \"%d\", \$2/1024}" /proc/meminfo)
  echo "Warning: There may not be enough free memory to run tests. Required: ${MEM_PER_PROCESS}KB; Free: ${FREE_KB}KB"
  PROCS=1
fi

echo "Running with parallelism: ${PROCS}"

$GRUNT_CMD preconcat

export SHELL=/bin/bash
if command -v parallel 2>/dev/null; then
  PARALLEL="parallel --will-cite --halt 2 -j ${PROCS} --joblog - :::"
else
  PARALLEL="xargs -P${PROCS} -d\n -L1 -n1 ${SHELL} -c"
fi

${PARALLEL} <<SCRIPT
npm run lint
(PORT=9876 ${GRUNT_CMD} unitTest && ${CODECOV} -cF unit)
(PORT=9877 $GRUNT_CMD storybookTest && ${CODECOV} -cF storybook)
# Since scratch tests are disable this also needs to be disable. If enable scratch tests
# then uncomment this
# (PORT=9878 $GRUNT_CMD scratchTest && ${CODECOV} -cF scratch)
(PORT=9879 LEVEL_TYPE='turtle' $GRUNT_CMD karma:integration && ${CODECOV} -cF integration)
(PORT=9880 LEVEL_TYPE='maze|bounce|calc|eval|flappy' $GRUNT_CMD karma:integration && ${CODECOV} -cF integration)
(PORT=9881 LEVEL_TYPE='gamelab' $GRUNT_CMD karma:integration && ${CODECOV} -cF integration)
(PORT=9882 LEVEL_TYPE='craft' $GRUNT_CMD karma:integration && ${CODECOV} -cF integration)
(PORT=9883 LEVEL_TYPE='applab1' $GRUNT_CMD karma:integration && ${CODECOV} -cF integration)
(PORT=9884 LEVEL_TYPE='applab2' $GRUNT_CMD karma:integration && ${CODECOV} -cF integration)
(PORT=9885 LEVEL_TYPE='studio' $GRUNT_CMD karma:integration && ${CODECOV} -cF integration)
SCRIPT
