#!/bin/bash
set -euo pipefail
if ! which nvme 1>2 2>/dev/null || ! which jq 1>2 2>/dev/null || ! which lvmdiskscan 1>2 2>/dev/null; then
  sudo apt-get update
  sudo apt-get install -y nvme-cli jq lvm2
fi
# List and extract the DevicePath for each "Amazon EC2 NVMe Instance Storage" device (ephemeral local storage)
device_list=$(
  nvme list -o json | jq -r '.Devices[] | select(.ModelNumber | test("instance storage"; "i")) | .DevicePath'
)

name="scratch"
if [[ $(lvs $name) ]]; then
  echo "[$(basename $0)] Logical volume $name already exists:"
  lvs -o lv_name,vg_name,devices $name
  echo
  lvs -o lv_name,lv_path,lv_size $name
else
  # if something goes wrong you can destroy ALL of the
  # things created here with:
  # vgremove scratch
  pvcreate $device_list
  vgcreate $name $device_list
  lvcreate -n $name -l 100%FREE $name
  mkfs.ext4 -m 0 /dev/$name/$name

  mkdir -p /$name
  chmod a+rwx /$name
  echo "/dev/$name/$name /$name ext4 defaults,noatime,nobarrier 0 2" >> /etc/fstab
fi

mount /$name
df -h /$name