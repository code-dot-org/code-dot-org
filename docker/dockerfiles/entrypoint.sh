#!/bin/sh

# Run https://github.com/boxboat/fixuid allow writes to bind-mounted code-dot-org directory
eval $( fixuid )

cd $HOME/code-dot-org

# Need to change ownership of volume mounts which are not bind-mounted to the uid/gid after fixuid is applied
sudo chown -R $USER:$GROUP \
        $HOME/.rbenv \
        $HOME/.config \
        $HOME/.cache

eval "$(rbenv init -)"

# start mysql
sudo service mysql start && mysql -V

# execute original command
exec "$@"
