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
  # MySQL community package only provides Debian service script.
  provider Chef::Provider::Service::Debian
end
node.override['cdo-apps']['local_mysql'] = true if node['cdo-apps']
