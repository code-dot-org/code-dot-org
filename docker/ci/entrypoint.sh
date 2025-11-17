#!/bin/sh

set -x

# Run https://github.com/boxboat/fixuid allow writes to bind-mounted code-dot-org directory
eval $( fixuid )

cd $HOME/code-dot-org

# Need to change ownership of volume mounts which are not bind-mounted to the uid/gid after fixuid is applied
ls -l /home/ci/.rbenv/versions/3.1.7/bin/bundler
sudo chown -R $USER:$GROUP $HOME/.rbenv
ls -l /home/ci/.rbenv/versions/3.1.7/bin/bundler
sudo chown -R $USER:$GROUP $HOME/.config
sudo chown -R $USER:$GROUP $HOME/.cache

eval "$(rbenv init -)"

# start mysql
sudo service mysql start && mysql -V

# execute original command
exec "$@"
