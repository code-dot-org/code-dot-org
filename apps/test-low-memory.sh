#!/bin/bash
set -e

MEM_PER_PROCESS=4200

function linuxNumProcs() {
  local nprocs=$(nproc)

  # Use MemAvailable when available, otherwise fall back to MemFree
  if grep -q MemAvailable /proc/meminfo; then
    local mem_metric=MemAvailable
  else
    local mem_metric=MemFree
  fi

  # Don't run more processes than can fit in free memory.
  local mem_procs=$(awk "/${mem_metric}/ {printf \"%d\", \$2/1024/${MEM_PER_PROCESS}}" /proc/meminfo)
  local procs=$(( ${mem_procs} < ${nprocs} ? ${mem_procs} : ${nprocs} ))

  if ((procs == 0)); then
    local free_kb=$(awk "/MemFree/ {printf \"%d\", \$2/1024}" /proc/meminfo)
    procs=1
  fi 

  echo $procs
}

if [ "$(uname)" = "Darwin" ]; then
  PROCS=2 # TODO: set this dynamically like in linux
elif [ "$(uname)" = "Linux" ]; then
  PROCS=$(linuxNumProcs)
else
  echo "$(uname) not supported"
  exit 1
fi

GRUNT_NODE_FLAGS="--node-options=--max-old-space-size=${MEM_PER_PROCESS}"
GRUNT_CMD="npx $GRUNT_NODE_FLAGS grunt"
$GRUNT_CMD preconcat

echo "Running with parallelism: ${PROCS}"
PARALLEL="parallel --will-cite --halt 2 -j ${PROCS} --joblog - :::"

${PARALLEL} <<SCRIPT
npm run lint

PORT=9876 $GRUNT_CMD unitTest
PORT=9877 $GRUNT_CMD storybookTest

PORT=9879 LEVEL_TYPE='turtle' $GRUNT_CMD karma:integration
PORT=9880 LEVEL_TYPE='maze|calc|eval' $GRUNT_CMD karma:integration
PORT=9881 LEVEL_TYPE='gamelab' $GRUNT_CMD karma:integration
PORT=9882 LEVEL_TYPE='craft' $GRUNT_CMD karma:integration
PORT=9883 LEVEL_TYPE='applab1' $GRUNT_CMD karma:integration
PORT=9884 LEVEL_TYPE='applab2' $GRUNT_CMD karma:integration
PORT=9885 LEVEL_TYPE='studio' $GRUNT_CMD karma:integration
SCRIPT
