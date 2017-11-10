# Installs Percona Monitoring and Management (PMM).

if (writer = node['cdo-secrets']['db_writer'])
  require 'open-uri'
  writer = URI(writer)
  node.default['cdo-pmm']['mysql']['host'] = writer.host
  node.default['cdo-pmm']['mysql']['port'] = writer.port
  node.default['cdo-pmm']['mysql']['user'] = writer.user
  node.default['cdo-pmm']['mysql']['password'] = writer.password
end

node.default['cdo-pmm']['linux_metrics'] = false if node['cdo-secrets']['db_writer']

include_recipe 'cdo-pmm'
