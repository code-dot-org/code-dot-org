#
# Cookbook Name:: cdo-nodejs
# Recipe:: default
#

include_recipe "cdo-java-7"

apt_package 'nodejs'
apt_package 'npm'

link "/usr/bin/node" do
  to "/usr/bin/nodejs"
end

execute "update npm" do
  command "npm update -g npm"
  user "root"
end

execute "npm install grunt" do
  command 'npm install -g grunt-cli'
  user "root"
  not_if 'npm -g ls grunt | grep -q grunt'
end

# These packages are used by node packages we install via grunt later.
apt_package 'libcairo2-dev'
apt_package 'libgif-dev'
apt_package 'libjpeg8-dev'
apt_package 'libpango1.0-dev'
