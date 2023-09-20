#!/bin/bash
set -e

# This should match MEM_PER_KARMA_PROCESS in Gruntfile.js
MEM_PER_KARMA_PROCESS=4300

function linuxNumProcs() {
  local nprocs=$(nproc)

  # Use MemAvailable when available, otherwise fall back to MemFree
  if grep -q MemAvailable /proc/meminfo; then
    local mem_metric=MemAvailable
  else
    local mem_metric=MemFree
  fi

  # Don't run more processes than can fit in free memory.
  local mem_procs=$(awk "/${mem_metric}/ {printf \"%d\", \$2/1024/${MEM_PER_KARMA_PROCESS}}" /proc/meminfo)
  local procs=$(( ${mem_procs} < ${nprocs} ? ${mem_procs} : ${nprocs} ))

  if ((procs == 0)); then
    local free_kb=$(awk "/MemFree/ {printf \"%d\", \$2/1024}" /proc/meminfo)
    procs=1
  fi 

  echo $procs
}

function macMemAvailableMB() {
  # Calculate MemAvailable equivalent for MacOS using `vm_stat` and `pagesize`
  local pagesize=$(pagesize)
  local mem_free_mb=$(vm_stat | awk "/Pages free:/ {printf \"%d\", \$3*${pagesize}/(1024*1024)}")
  local mem_inactive_mb=$(vm_stat | awk "/Pages inactive:/ {printf \"%d\", \$3*${pagesize}/(1024*1024)}")
  local mem_speculative_mb=$(vm_stat | awk "/Pages speculative:/ {printf \"%d\", \$3*${pagesize}/(1024*1024)}")
  local mem_available_mb=$(( mem_free_mb + mem_inactive_mb + mem_speculative_mb ))
  echo $mem_available_mb
}

function macNumProcs() {
  local mem_procs=$(( $(macMemAvailableMB) / MEM_PER_KARMA_PROCESS ))
  local procs=$(( ${mem_procs} < $(nproc) ? ${mem_procs} : $(nproc) ))

  # Run at least two copies in parallel
  if ((procs <= 2)); then
    procs=2
  fi

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

NODE_OPTIONS="--max-old-space-size=${MEM_PER_KARMA_PROCESS}"

echo "Running with parallelism: ${PROCS}"
PARALLEL="parallel --will-cite --halt 2 -j ${PROCS} --joblog - :::"

npx grunt preconcatForKarma

${PARALLEL} <<SCRIPT
  npm run lint

  npx karma start --testType=unit --port=9876
  npx karma start --testType=storybook --port=9877

  npx karma start --testType=integration --levelType='turtle' --port=9879
  npx karma start --testType=integration --levelType='maze|calc|eval' --port=9880
  npx karma start --testType=integration --levelType='gamelab' --port=9881
  npx karma start --testType=integration --levelType='craft' --port=9882
  npx karma start --testType=integration --levelType='applab1' --port=9883
  npx karma start --testType=integration --levelType='applab2' --port=9884
  npx karma start --testType=integration --levelType='studio' --port=9885
SCRIPT
