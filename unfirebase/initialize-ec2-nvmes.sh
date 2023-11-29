#!/bin/bash
set -euo pipefail
if ! which nvme 1>2 2>/dev/null || ! which jq 1>2 2>/dev/null; then
  sudo apt-get update
  sudo apt-get install -y nvme-cli jq
fi
# List and extract the DevicePath for each "Amazon EC2 NVMe Instance Storage" device (ephemeral local storage)
device_list=$(
  nvme list -o json | jq -r '.Devices[] | select(.ModelNumber | test("instance storage"; "i")) | .DevicePath'
)
# The following loop assumes that all ephemeral devices will either require formatting or not; should one be
# already formatted, the loop will likely encounter an error due to the sequential index used to label them
device_index=0
for device_path in $device_list; do
  if [[ ! $(lsblk -nfo uuid $device_path) ]]; then
    device_label=$(printf "scratch%02d" $device_index)
    echo "[$(basename $0)] Formatting $device_path with LABEL=$device_label"
    mkfs -t ext4 -L $device_label $device_path
    ((device_index+=1)) # Increment index for next iteration
  else
    device_label=$(lsblk -nfo label $device_path)
    echo "[$(basename $0)] Device $device_path already formatted with LABEL=$device_label"
  fi
  if ! grep -qs /$device_label /proc/mounts; then
    echo "[$(basename $0)] Mounting $device_path at /$device_label"
    mkdir -p /$device_label
    mount -o rw,noatime,nobarrier $device_path /$device_label
  else
    echo "[$(basename $0)] Mount /$device_label already exists:"
    echo "[$(basename $0)] $(grep -s /$device_label /proc/mounts)"
  fi
done