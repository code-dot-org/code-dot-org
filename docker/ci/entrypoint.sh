#!/bin/sh

set -x

# Run https://github.com/boxboat/fixuid allow writes to bind-mounted code-dot-org directory
eval $( fixuid )

eval "$(rbenv init -)"

# start mysql
sudo service mysql start && mysql -V

# execute original command
exec "$@"
