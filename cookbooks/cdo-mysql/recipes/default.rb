#
# Cookbook Name:: cdo-mysql
# Recipe:: default
#

include_recipe 'cdo-mysql::client'

# Install server unless an external writer endpoint is provided.
writer = URI.parse(node['cdo-secrets']['db_writer'].to_s)
include_recipe 'cdo-mysql::server' unless writer.hostname

# Install proxy if enabled.
include_recipe 'cdo-mysql::proxy' if node['cdo-mysql']['proxy']['enabled']
