#!/bin/bash
set -e

# This should be reviewed every couple of years to see if an increase improves
# test performance. Even if tests run in a given memory limit, if memory is 
# /super/ tight GC will run frequently and test perf will nosedive.
#
# MEM_PER_PROCESS should match the --max_old_space_size set for `npm run test:unit`
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

function macNumProcs() {
  # FIXME: top's PhysMem unused is not a great metric for available memory:
  # it waaaaay underestimates how much memory is actually available
  # but no equivalent to Linux's MemAvailable is available on Mac.
  
  local min_procs=2

  # extract unused ###G from `top -l1` line like:
  # PhysMem: 13G used (3248M wired, 4117M compressor), 3G unused
  local unused_mem_regex='^PhysMem.* ([0-9]+)G unused.*$'
  if [[ $(top -l1 | grep -e '^PhysMem') =~ $unused_mem_regex ]]; then
    local unusedMemGB=${BASH_REMATCH[1]}
    local mem_procs=$(( unusedMemGB * 1024 / ${MEM_PER_PROCESS}))
    # Overshoot by one process to get better performance. Works because 
    # using top's PhysMem undershoots by a LOT on lower-mem macs.
    mem_procs=$(( mem_procs + 1 ))
  else
    echo "Couldn't parse `top -l1` output to find amount of unused memory."
    local mem_procs=$min_procs
  fi

  nprocs=$(nproc)
  mem_procs=$(( mem_procs < min_procs ? min_procs : mem_procs ))
  procs=$(( mem_procs < nprocs ? mem_procs : nprocs ))

  echo $procs
}

if [ "$(uname)" = "Darwin" ]; then
  PROCS=$(macNumProcs)
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
