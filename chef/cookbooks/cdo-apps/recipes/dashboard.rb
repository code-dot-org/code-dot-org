include_recipe 'cdo-apps::aws'
include_recipe 'cdo-varnish'

template "/etc/init.d/dashboard" do
  source 'init.d.erb'
  user 'root'
  group 'root'
  mode '0755'
  variables ({
    src_file:"/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/config/unicorn.rb",
    app_root:"/home/#{node[:current_user]}/#{node.chef_environment}/dashboard",
    pid_file:"/home/#{node[:current_user]}/#{node.chef_environment}/aws/dashboard_unicorn.rb.pid",
    user:node[:current_user],
    env:node.chef_environment,
  })
  notifies :run, 'execute[bundle-install-dashboard]', :immediately
end

template "/etc/logrotate.d/dashboard" do
  source 'logrotate.erb'
  user 'root'
  group 'root'
  mode '0644'
  variables ({
    log_dir:"/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/log",
  })
end

execute "bundle-install-dashboard" do
  command "sudo bundle install"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard"
  user node[:current_user]
  group node[:current_user]
  action :nothing
  notifies :run, 'execute[build-dashboard]', :immediately
end

execute "build-dashboard" do
  command "rake build:dashboard"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}"
  environment ({
    'LC_ALL'=>nil,
  })
  user node[:current_user]
  group node[:current_user]
  action :nothing
end

service 'dashboard' do
  action [:enable, :start]
end
