#!/bin/bash

eval "$(rbenv init -)"


# Dir.chdir(dashboard_dir) do
#   RakeUtils.bundle_install
#   puts CDO.dashboard_db_writer
#   if ENV['CI']
#     # Prepare for dashboard unit tests to run. We can't seed UI test data
#     # yet because doing so would break unit tests.
#     RakeUtils.rake 'db:create db:test:prepare'
#   else
#     RakeUtils.rake_stream_output 'dashboard:setup_db', ([:adhoc, :development].include?(rack_env) ? '--trace' : nil)
#   end
# end

cd dashboard

# This is used by the dashboard unit tests and is much faster.
# Do we need to seed UI test data by default?
# bundle exec rake db:create db:test:prepare

bundle exec rake dashboard:setup_db
cd ..

# Dir.chdir(pegasus_dir) do
#   RakeUtils.bundle_install
#   RakeUtils.rake 'pegasus:setup_db'
# end

cd pegasus
bundle exec rake pegasus:setup_db

echo
echo "DB setup complete."