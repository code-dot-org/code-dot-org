#!/bin/bash
export USER=alih
export PATH=/home/alih/bin:/home/alih/.local/bin:/home/alih/.rbenv/bin:~/.rbenv/shims:/home/alih/.rbenv/bin:/home/alih/.nvm/versions/node/v8.15.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
export LOGNAME=alih

cd /home/alih/code-dot-org/dashboard/
bundle exec puma -C /home/alih/code-dot-org/dashboard/config/puma.rb
