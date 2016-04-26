apt_package 'mysql-server-5.6'
service 'mysql' do
  action [:enable, :start]
  # Detect if upstart service is running on Ubuntu 14.04.
  # Upstart is running on ec2 instances but usually not running on local Docker.
  upstart_booted = `test -x /sbin/initctl && /sbin/initctl --version`.include? 'upstart'
  if upstart_booted
    provider Chef::Provider::Service::Upstart
  else
    provider Chef::Provider::Service::Debian
  end
end
node.override['cdo-apps']['local_mysql'] = true if node['cdo-apps']
