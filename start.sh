#!/bin/bash

#service mysql start && echo 'ruby' && which ruby && echo 'chef' && ls /tmp/chef

#echo 'trying to set'

#echo $(id -u ubuntu) > /proc/self/loginuid

#echo 'after set'

#echo $(ls /var/chef/)

#sudo -u ubuntu -H /bin/bash -c 'sudo chef-client -z -c /tmp/chef/zero.rb -j /tmp/chef/first-boot.json' ; top -b

sudo rm -rf /var/run/unicorn

sudo rm /home/ubuntu/adhoc/dashboard/config/unicorn.rb.pid

sudo rm /home/ubuntu/adhoc/pegasus/config/unicorn.rb.pid

sudo chef-client -z -c /tmp/chef/zero.rb -j /tmp/chef/first-boot.json ; top -b
