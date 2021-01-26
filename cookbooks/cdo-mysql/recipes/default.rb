#
# Cookbook Name:: cdo-mysql
# Recipe:: default
#

include_recipe 'cdo-mysql::client'

# Install server unless an external writer endpoint is provided.
writer = URI.parse(node['cdo-secrets']['db_writer'].to_s)
include_recipe 'cdo-mysql::server' unless writer.hostname

# Override db_writer variable with RDS-proxy endpoint if provided.
if (rds_proxy = node['cdo-mysql']['rds_proxy'])
  node.override['cdo-secrets']['db_writer'] =
    writer.dup.tap {|w| w.hostname = rds_proxy}.to_s

# Otherwise install ProxySQL if enabled.
elsif node['cdo-mysql']['proxy']['enabled']
  include_recipe 'cdo-mysql::proxy'
end
