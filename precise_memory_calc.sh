#!/bin/bash

# Assuming 64GB RAM (64 * 1024 MB)
TOTAL_RAM_MB=65536
PERCENT_OF_MEM_AVAILABLE_TO_USE_FOR_TESTS=80

mem_you_can_use_mb=$(( TOTAL_RAM_MB * PERCENT_OF_MEM_AVAILABLE_TO_USE_FOR_TESTS / 100 ))

echo "Total RAM: ${TOTAL_RAM_MB} MB (64 GB)"
echo "Target memory to use (80%): ${mem_you_can_use_mb} MB"
echo ""
echo "=================================================================="
echo ""

# Question 1: What % does 4300 get me?
echo "Q1: What % mem usage does MEM_PER_TEST_PROCESS_MB = 4300 get me?"
echo "----------------------------------------------------------------"
MEM_PER_PROC=4300
num_procs=$(( mem_you_can_use_mb / MEM_PER_PROC ))
actual_mem_used=$(( num_procs * MEM_PER_PROC ))
percent_used=$(( actual_mem_used * 100 / TOTAL_RAM_MB ))
echo "  Processes: ${num_procs}"
echo "  Memory used: ${actual_mem_used} MB"
echo "  Answer: ${percent_used}% memory utilization"
echo ""

# Question 2: What number to reach 80% with 11 processes?
echo "Q2: What MEM_PER_TEST_PROCESS_MB to reach ~80% with 11 processes?"
echo "----------------------------------------------------------------"
TARGET_PROCS=11
optimal_mem=$(( mem_you_can_use_mb / TARGET_PROCS ))
actual_mem_used=$(( TARGET_PROCS * optimal_mem ))
percent_used=$(( actual_mem_used * 100 / TOTAL_RAM_MB ))
echo "  Answer: MEM_PER_TEST_PROCESS_MB = ${optimal_mem}"
echo "  This gives: ${TARGET_PROCS} processes"
echo "  Memory used: ${actual_mem_used} MB"
echo "  Memory utilization: ${percent_used}%"
echo ""

# Question 3: What number to reach 80% with 12 processes?
echo "Q3: What MEM_PER_TEST_PROCESS_MB to reach ~80% with 12 processes?"
echo "----------------------------------------------------------------"
TARGET_PROCS=12
optimal_mem=$(( mem_you_can_use_mb / TARGET_PROCS ))
actual_mem_used=$(( TARGET_PROCS * optimal_mem ))
percent_used=$(( actual_mem_used * 100 / TOTAL_RAM_MB ))
echo "  Answer: MEM_PER_TEST_PROCESS_MB = ${optimal_mem}"
echo "  This gives: ${TARGET_PROCS} processes"
echo "  Memory used: ${actual_mem_used} MB"
echo "  Memory utilization: ${percent_used}%"
echo ""
