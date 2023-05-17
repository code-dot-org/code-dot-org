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

drone-rerun-failed () {
  drone-do $1 <<- 'CMDS'
    export CI=true
    export CIRCLECI=true
    export RAILS_ENV=test
    export RACK_ENV=test
    export DISABLE_SPRING=1
    export LD_LIBRARY_PATH=/usr/local/lib
    # If running on Drone.io, DRONE_BUILD_NUMBER will be set: https://docs.drone.io/reference/environ/drone-build-number/
    # otherwise, use a random number instead. CIRCLE_BUILD_NUM determines where UI test cucumber logs are stored in S3.
    export CIRCLE_BUILD_NUM=${DRONE_BUILD_NUMBER:-$RANDOM$RANDOM}
    export CIRCLE_NODE_INDEX=1
    rm -rf /home/circleci/test_reports
    rm -rf /home/circleci/artifacts
    export CIRCLE_TEST_REPORTS=/home/circleci/test_reports
    export CIRCLE_ARTIFACTS=/home/circleci/artifacts

    mkdir -p $CIRCLE_ARTIFACTS
    
    CIRCLE_RERUN_FAILED=1 bundle exec rake circle:run_ui_tests
CMDS
}