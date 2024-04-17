#!/bin/bash
# This is the implementation of `yarn test`. It runs all the tests 
# (just like `npx karma start`) would, but it splits them into parallel jobs.
#
# If you want to add a new levelType or testType to `yarn test`, add an
# `npx karma start` invocation to the list below.

set -e

MEM_PER_KARMA_PROCESS_MB=$(node -e "console.log(require('./Gruntfile').MEM_PER_KARMA_PROCESS_MB)" 2>/dev/null)
NODE_OPTIONS="--max-old-space-size=${MEM_PER_KARMA_PROCESS_MB}"

function linuxNumProcs() {
  local nprocs=$(nproc)

  # Use MemAvailable when available, otherwise fall back to MemFree
  if grep -q MemAvailable /proc/meminfo; then
    local mem_metric=MemAvailable
  else
    local mem_metric=MemFree
  fi

  # Don't run more processes than can fit in free memory.
  local mem_procs=$(awk "/${mem_metric}/ {printf \"%d\", \$2/1024/${MEM_PER_KARMA_PROCESS_MB}}" /proc/meminfo)
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
  local mem_procs=$(( $(macMemAvailableMB) / MEM_PER_KARMA_PROCESS_MB ))
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

echo && echo
echo "##################################################"
echo "#     Running test jobs with ${PROCS}x-parallelism     #"
echo "##################################################"
echo

echo && echo "Starting jest"

npx jest --silent --maxWorkers ${PROCS}

echo && echo "Pre-webpacking karma tests before running them:"

npx grunt preconcatForKarma

# This pre-webpack is *important* to avoid file-overwriting race conditions
# as each karma invocation semi-unavoidably does its own webpack. This works
# because Webpack does NOT overwrite files that turn out identical, and tests
# all run from the same `test/entry-point.js` => identical webpack output.
#
# TODO: figure out how to skip the per-karma-start webpack to save 20s+ test time
# without breaking sourcemaps.
npx karma start --testType=dontTestJustWebpack

echo && echo && echo "Starting ${PROCS}x-parallel test jobs:"
PARALLEL="parallel --will-cite --halt 2 -j ${PROCS} --joblog - :::"

# Each line in this SCRIPT block will be run as a parallel test job
# If any line fails, the whole block will fail and exit early
${PARALLEL} <<SCRIPT || (echo && echo && echo "One of the parallel test jobs FAILED, exiting early." && echo && exit 1)
  yarn lint
  npx karma start --testType=unit --port=9876
  npx karma start --testType=storybook --port=9877
  npx karma start --testType=integration --levelType='turtle' --port=9879
  npx karma start --testType=integration --levelType='maze' --port=9880
  npx karma start --testType=integration --levelType='gamelab' --port=9881
  npx karma start --testType=integration --levelType='craft' --port=9882
  npx karma start --testType=integration --levelType='applab1' --port=9883
  npx karma start --testType=integration --levelType='applab2' --port=9884
  npx karma start --testType=integration --levelType='studio' --port=9885
SCRIPT

echo && echo
echo "###################################################"
echo "#         All parallel test jobs PASSED           #"
echo "###################################################"
echo