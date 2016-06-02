#!/bin/bash

[ -f "/var/run/unicorn/dashboard.sock" ] && sudo rm /var/run/unicorn/dashboard.sock
[ -f "/var/run/unicorn/pegasus.sock" ] && sudo rm /var/run/unicorn/pegasus.sock

[ -f "/home/ubuntu/adhoc/dashboard/config/unicorn.rb.pid" ] && sudo rm /home/ubuntu/adhoc/dashboard/config/unicorn.rb.pid
[ -f "/home/ubuntu/adhoc/pegasus/config/unicorn.rb.pid" ] && sudo rm /home/ubuntu/adhoc/pegasus/config/unicorn.rb.pid

sudo service mysql start

cd /home/ubuntu/adhoc/
sudo bundle install

cd /home/ubuntu/adhoc/dashboard
sudo bundle exec rake db:migrate

cd /home/ubuntu/adhoc/pegasus
sudo bundle exec rake db:migrate

[ -d "/tmp/chef/cookbooks" ] && rm -rf /tmp/chef/cookbooks
[ -d "/tmp/chef/local-mode-cache" ] && sudo rm -rf /tmp/chef/local-mode-cache
mkdir /tmp/chef/cookbooks
cd /home/ubuntu/adhoc/cookbooks
berks vendor /tmp/chef/cookbooks

sudo chef-client -z -c /tmp/chef/local-adhoc.rb -j /tmp/chef/local-adhoc.json

top -b >/dev/null 2>&1
