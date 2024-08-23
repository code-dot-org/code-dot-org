#!/bin/bash
set -e

# Check if the database has been seeded
if [ ! -f /app/dashboard/config/scripts/.seeded ]; then
  echo "Prep for quick start... Dropping DB..."
  cd dashboard
  bundle exec rake db:drop
  cd ..

  echo "Database not seeded, running rake install..."
  bundle exec rake install
else
  echo "Database already seeded, skipping rake install."
fi

# Check if the build directory exists
if [ ! -e /app/apps/build/commit_hash ]; then
  echo "Build directory not found, running rake build..."
  bundle exec rake build
else
  echo "Build directory found, skipping rake build."
fi

# Start the dashboard server
echo "Starting the dashboard server..."
exec ./bin/dashboard-server