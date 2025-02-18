# Set up log rotation for the generic logs directory at the root of the repo.
# Log rotation for the dashboard and pegasus directories is established by CdoApps.setup_app

template '/etc/logrotate.d/code-dot-org' do
  source 'logrotate.erb'
  user 'root'
  group 'root'
  mode '0644'
  variables log_dir: "#{node[:home]}/#{node.chef_environment}/log"
end
