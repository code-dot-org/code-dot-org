#
# Cookbook Name:: cdo-nodejs
# Recipe:: default
#

# Install binary nodejs from nodesource apt repo
execute 'install_nodesource_repo' do
  command "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
  not_if "test -f /etc/apt/sources.list.d/nodesource.list"
end

package 'nodejs' do
  action :upgrade
end

execute 'enable corepack for yarn support' do
  command 'corepack enable'
end
