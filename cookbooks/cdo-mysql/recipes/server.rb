include_recipe 'apt'

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

service 'mysql' do
  action [:enable, :start]
  provider Chef::Provider::Service::Systemd
  subscribes :restart, 'template[cdo.cnf]', :immediately
end
node.override['cdo-apps']['local_mysql'] = true if node['cdo-apps']
