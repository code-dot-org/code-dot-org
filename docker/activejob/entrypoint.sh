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

# execute original command
exec "$@"

# Custom initialization logic can go here
# For example, check for the presence of mounted volumes:
if [ ! -d "/home/circleci/code-dot-org" ]; then
  echo "The code-dot-org directory is not mounted. Exiting..."
  exit 1
fi

# Wait for the database to be ready
# This is useful if your service depends on the database to be fully operational before starting
# echo "Waiting for database to be ready..."
# while ! nc -z db 3306; do   
#   sleep 1 # wait for 1 second before check again
# done
# echo "Database is ready!"

# Installing dependencies
echo "Installing dependencies..."
bundle install

# Execute the main process
# Assuming the main process is a Ruby on Rails job worker
# Customize this command based on your specific needs
echo "Starting ActiveJob workers..."
cd dashboard
exec bin/delayed_job run
