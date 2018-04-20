include_recipe 'cdo-mysql::repo'

apt_package 'mysql-server' do
  action :upgrade
  notifies :run, 'execute[mysql-upgrade]', :delayed
  notifies :run, 'execute[mysql-user]',    :delayed
end

execute 'mysql-upgrade' do
  command 'mysql_upgrade --user=root'
  action :nothing
  notifies :restart, 'service[mysql]', :immediately
end

# MySQL 5.7 Ubuntu package uses auth_socket plugin for local user by default.
# Revert to mysql_native_password plugin to authenticate from non-root shell.
execute 'mysql-user' do
  command "echo \"ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';\" | mysql"
  action :nothing
end

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
