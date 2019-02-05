#!/bin/sh

cd /home/circleci/code-dot-org

# Run https://github.com/boxboat/fixuid allow writes to bind-mounted code-dot-org directory
eval $( fixuid )

# Need to change ownership of volume mounts which are not bind-mounted to the uid/gid after fixuid is applied
sudo chown -R circleci:circleci /home/circleci/.rbenv \
	/home/circleci/code-dot-org/apps/node_modules

eval "$(rbenv init -)"

# start mysql
sudo service mysql start && mysql -V

# execute original command
exec "$@"
