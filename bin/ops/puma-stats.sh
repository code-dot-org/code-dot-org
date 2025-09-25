#!/bin/bash
set -euo pipefail

# This script displays memory usage of Puma workers for dashboard and pegasus.
# In Spring 2025, we began tripping our 87% mem_used_percent alarm more
# frequently. This script helps identify the memory usage of Puma workers on our
# frontend EC2 instances. If our estimated usage, defined in
# "cookbooks/cdo-apps/recipes/workers.rb" is lower than actual usage, then we
# are provisioning too many workers and risk running out of memory.

# Discover Puma master PIDs
masters=$(ps -eo pid,ppid,cmd | grep 'puma' | grep -v 'worker' | grep -v grep | awk '$2 == 1 {print $1}')

for master in $masters; do
  label=$(ps -p "$master" -o cmd= | grep -oE '\[(dashboard|pegasus)\]' | tr -d '[]' || echo "unknown")
  echo "=== Workers for $label (master PID $master) ==="
  
  # loop over all child processes of the dashboard or pegasus master
  for pid in $(pgrep -P "$master"); do
    # inspect the process file in /proc/<pid>/status to get memory usage
    if [ -r "/proc/$pid/status" ]; then
      # Extract VmRSS (Resident Set Size, aka physical memory used)
      rss_kb=$(awk '/VmRSS/ {print $2}' /proc/$pid/status)
      rss_mb=$((rss_kb / 1024))
      echo "$rss_mb MB - PID $pid"
    fi
  done | sort -nr # Sort by memory usage, descending
done
