#!/bin/bash

[ -f "/var/run/unicorn/dashboard.sock" ] && sudo rm /var/run/unicorn/dashboard.sock
[ -f "/var/run/unicorn/pegasus.sock" ] && sudo rm /var/run/unicorn/pegasus.sock

[ -f "/home/ubuntu/adhoc/dashboard/config/unicorn.rb.pid" ] && sudo rm /home/ubuntu/adhoc/dashboard/config/unicorn.rb.pid
[ -f "/home/ubuntu/adhoc/pegasus/config/unicorn.rb.pid" ] && sudo rm /home/ubuntu/adhoc/pegasus/config/unicorn.rb.pid

sudo service mysql start

cd /home/ubuntu/adhoc/
sudo bundle install

cd /home/ubuntu/adhoc/dashboard
sudo RAILS_ENV=adhoc RACK_ENV=adhoc bundle exec rake db:migrate

cd /home/ubuntu/adhoc/pegasus
sudo RAILS_ENV=adhoc RACK_ENV=adhoc bundle exec rake db:migrate

cd /home/ubuntu/adhoc
# These build commands are commented out because they haven't been tested yet
#sudo bundle exec rake build:blockly_core
#sudo bundle exec rake build:apps
#sudo bundle exec rake build:code_studio
sudo RAILS_ENV=adhoc RACK_ENV=adhoc bundle exec rake build:dashboard
sudo RAILS_ENV=adhoc RACK_ENV=adhoc bundle exec rake build:pegasus

[ -d "/home/ubuntu/chef" ] && sudo rm -rf /home/ubuntu/chef
[ -d "/home/ubuntu/adhoc/.chef/local-mode-cache" ] && sudo rm -rf /home/ubuntu/adhoc/.chef/local-mode-cache
[ -d "/tmp/chef/local-mode-cache" ] && sudo rm -rf /tmp/chef/local-mode-cache


mkdir /home/ubuntu/chef
mkdir /home/ubuntu/chef/cookbooks
cp /home/ubuntu/adhoc/.chef/* /home/ubuntu/chef/
cd /home/ubuntu/adhoc/cookbooks
berks vendor /home/ubuntu/chef/cookbooks

cd /home/ubuntu
sudo RAILS_ENV=adhoc RACK_ENV=adhoc chef-client -z -c /home/ubuntu/chef/local-adhoc.rb -j /home/ubuntu/chef/local-adhoc.json

sudo service nginx restart

top -b >/dev/null 2>&1
