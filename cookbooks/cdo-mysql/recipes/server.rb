include_recipe 'cdo-mysql::repo'

apt_package 'mysql-server' do
  action :upgrade
  notifies :create, 'template[cdo.cnf]', :immediately
  notifies :start, 'service[mysql]', :immediately
  notifies :run, 'execute[mysql-upgrade]', :immediately
  notifies :run, 'execute[mysql-user]',    :immediately
end

template 'cdo.cnf' do
  path "/etc/mysql/conf.d/#{name}"
end

execute 'mysql-upgrade' do
  command 'mysql_upgrade --user=root'
  action :nothing
  notifies :start, 'service[mysql]', :before
  notifies :restart, 'service[mysql]', :immediately
end

# MySQL 5.7 Ubuntu package uses auth_socket plugin for local user by default.
# Revert to mysql_native_password plugin to authenticate from non-root shell.
execute 'mysql-user' do
  command <<SH
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';"
SH
  action :nothing
end

service 'mysql' do
  action [:enable, :start]
  # MySQL community package only provides Debian service script.
  #provider Chef::Provider::Service::Debian
  provider Chef::Provider::Service::Systemd
  subscribes :restart, 'template[cdo.cnf]', :immediately
end
node.override['cdo-apps']['local_mysql'] = true if node['cdo-apps']
