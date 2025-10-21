#!/bin/bash

echo "Analysis of parallelization discrepancy"
echo "========================================"
echo ""

# Count the actual number of test jobs in the script
echo "Counting test jobs in run-tests-in-parallel.sh:"
echo "------------------------------------------------"
grep -E "^\s+(yarn lint|npx karma start)" apps/run-tests-in-parallel.sh | wc -l | xargs echo "Number of test jobs in parallel block:"

echo ""
echo "The test jobs are:"
grep -E "^\s+(yarn lint|npx karma start)" apps/run-tests-in-parallel.sh | sed 's/^  /  /'

echo ""
echo "System resources:"
echo "----------------"
echo "CPUs: 16"
echo "RAM: 64 GB"
echo "MEM_PER_TEST_PROCESS_MB: 4300"
echo ""

# Calculate what the formula would give
TOTAL_RAM_MB=65536
PERCENT=80
mem_you_can_use_mb=$(( TOTAL_RAM_MB * PERCENT / 100 ))
mem_procs=$(( mem_you_can_use_mb / 4300 ))
echo "Formula calculation:"
echo "  mem_you_can_use_mb = ${mem_you_can_use_mb} MB"
echo "  mem_procs (mem_you_can_use_mb / 4300) = ${mem_procs}"
echo "  nprocs (CPUs) = 16"
echo "  final procs = min(${mem_procs}, 16) = $(( ${mem_procs} < 16 ? ${mem_procs} : 16 ))"
echo ""

echo "Conclusion:"
echo "----------"
echo "The discrepancy between 11x and 12x is NOT due to CPU or memory constraints."
echo ""
echo "Possible explanations for seeing 11x parallelization:"
echo "1. The script has only 10 test jobs defined, which limits max parallelization to 10x"
echo "2. If you're seeing 11x, it might include the pre-webpack job or another process"
echo "3. Available memory at runtime might be less than total RAM (MemAvailable vs MemTotal)"
echo "4. Something is consuming memory, reducing MemAvailable below expected levels"
echo ""
echo "To debug further, you could:"
echo "- Check actual MemAvailable: grep MemAvailable /proc/meminfo (on Linux)"
echo "- Check what the script calculates: Add 'echo \$PROCS' debugging to the script"
echo "- Check if there are background processes consuming significant memory"
