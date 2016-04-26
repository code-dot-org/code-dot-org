#
# Cookbook Name:: cdo-nodejs
# Recipe:: default
#

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
