#!/bin/bash

drone-do () {
  ssh -tt gateway.code.org "ssh -tti ~/.ssh/drone_access_key ubuntu@$1 sudo docker exec -it \\\`sudo docker ps -lq\\\` bash"
}

drone-git-pull () {
  drone-do $1 <<- 'CMDS'
    set -x
    git fetch
    git reset --hard @{u}
    git merge --no-edit origin/$DRONE_TARGET_BRANCH
    exit
CMDS
}

drone-vscode-tunnel () {
  drone-do $1 <<- 'CMDS'
    cd ~
    curl -Lk 'https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64' --output vscode_cli.tar.gz
    tar -xf vscode_cli.tar.gz
    cd $DRONE_WORKSPACE
    ~/code tunnel --accept-server-license-terms
    exit
CMDS
}