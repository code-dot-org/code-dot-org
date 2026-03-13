#!/bin/sh

# Run https://github.com/boxboat/fixuid allow writes to bind-mounted code-dot-org directory
eval $( fixuid )

# Only run local development setup when FIXUID is set (see ui-tests-compose.yml).
# In CI, Drone handles the working directory and file ownership, and skipping
# these steps saves valuable time.
if [ -n "$FIXUID" ]; then
    cd $HOME/code-dot-org
    sudo chown -R $USER:$GROUP \
            $HOME/.rbenv \
            $HOME/.config \
            $HOME/.cache
fi

eval "$(rbenv init -)"

# start mysql
sudo service mysql start && mysql -V

# execute original command
exec "$@"
