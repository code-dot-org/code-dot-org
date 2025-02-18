#
# Cookbook Name:: cdo-nodejs
# Recipe:: default
#

# Install binary nodejs from nodesource apt repo
node.default['nodejs']['repo'] = "https://deb.nodesource.com/node_#{node['cdo-nodejs']['version']}"
include_recipe 'nodejs'

# Keep nodejs up to date
package 'nodejs' do
  action :upgrade
end

execute 'enable corepack for yarn support' do
  command 'corepack enable'
end
