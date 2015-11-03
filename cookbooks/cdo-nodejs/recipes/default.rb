#
# Cookbook Name:: cdo-nodejs
# Recipe:: default
#

node.default['nodejs']['repo'] = "https://deb.nodesource.com/node_#{node['cdo-nodejs']['version']}"
include_recipe 'nodejs'

# Keep nodejs up to date
package 'nodejs' do
  action :upgrade
end

nodejs_npm 'npm' do
  version node['cdo-nodejs']['npm_version']
end

nodejs_npm 'grunt-cli'
