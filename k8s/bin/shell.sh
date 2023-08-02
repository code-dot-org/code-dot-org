#!/usr/bin/env bash

args=("$@")
if [ $# -eq 0 ]; then
  args=(/bin/zsh)
fi
kubectl exec -it deploy/dashboard -- "${args[@]}"