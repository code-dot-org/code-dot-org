#!/bin/bash

sudo rm /var/run/unicorn/dashboard.sock
sudo rm /var/run/unicorn/pegasus.sock

sudo rm /home/ubuntu/adhoc/dashboard/config/unicorn.rb.pid
sudo rm /home/ubuntu/adhoc/pegasus/config/unicorn.rb.pid

cd /home/ubuntu/adhoc/dashboard
sudo bundle exec rake db:migrate

cd /home/ubuntu/adhoc/pegasus
sudo bundle exec rake db:migrate

sudo chef-client -z -c /tmp/chef/zero.rb -j /tmp/chef/first-boot.json

top -b >/dev/null 2>&1
