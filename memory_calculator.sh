#!/bin/bash

# Assuming 64GB RAM (64 * 1024 MB)
TOTAL_RAM_MB=65536
PERCENT_OF_MEM_AVAILABLE_TO_USE_FOR_TESTS=80

echo "Total RAM: ${TOTAL_RAM_MB} MB (64 GB)"
echo "Target usage: ${PERCENT_OF_MEM_AVAILABLE_TO_USE_FOR_TESTS}%"
echo "Target memory to use: $(( TOTAL_RAM_MB * PERCENT_OF_MEM_AVAILABLE_TO_USE_FOR_TESTS / 100 )) MB"
echo ""
echo "Sweet spots (MEM_PER_TEST_PROCESS_MB values that get closest to 80% usage):"
echo "=================================================================="
echo ""

mem_you_can_use_mb=$(( TOTAL_RAM_MB * PERCENT_OF_MEM_AVAILABLE_TO_USE_FOR_TESTS / 100 ))

# Test different MEM_PER_TEST_PROCESS_MB values
for mem_per_proc in 2048 2560 3072 3276 4096 4300 5120 6144 6553 8192; do
  num_procs=$(( mem_you_can_use_mb / mem_per_proc ))

  # Skip if no processes can run
  if (( num_procs == 0 )); then
    continue
  fi

  actual_mem_used=$(( num_procs * mem_per_proc ))
  percent_used=$(( actual_mem_used * 100 / TOTAL_RAM_MB ))

  echo "MEM_PER_TEST_PROCESS_MB = ${mem_per_proc}"
  echo "  Number of processes: ${num_procs}"
  echo "  Actual memory used: ${actual_mem_used} MB"
  echo "  Percentage of total: ${percent_used}%"
  echo "  Distance from 80%: $(( percent_used > 80 ? percent_used - 80 : 80 - percent_used ))%"
  echo ""
done

echo ""
echo "Current value analysis (MEM_PER_TEST_PROCESS_MB = 4300):"
echo "=================================================================="
MEM_PER_TEST_PROCESS_MB=4300
num_procs=$(( mem_you_can_use_mb / MEM_PER_TEST_PROCESS_MB ))
actual_mem_used=$(( num_procs * MEM_PER_TEST_PROCESS_MB ))
percent_used=$(( actual_mem_used * 100 / TOTAL_RAM_MB ))

echo "Number of processes: ${num_procs}"
echo "Actual memory used: ${actual_mem_used} MB ($(( actual_mem_used / 1024 )) GB)"
echo "Percentage of total: ${percent_used}%"
echo "Wasted headroom: $(( mem_you_can_use_mb - actual_mem_used )) MB"
