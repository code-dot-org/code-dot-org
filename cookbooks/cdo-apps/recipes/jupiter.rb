include_recipe 'cdo-apps::aws'
include_recipe 'cdo-varnish'

template "/etc/init.d/jupiter" do
  source 'init.d.erb'
  user 'root'
  group 'root'
  mode '0755'
  variables ({
    src_file:"/home/#{node[:current_user]}/#{node.chef_environment}/jupiter/config/unicorn.rb",
    app_root:"/home/#{node[:current_user]}/#{node.chef_environment}/jupiter",
    pid_file:"/home/#{node[:current_user]}/#{node.chef_environment}/jupiter/config/unicorn.rb.pid",
    user:node[:current_user],
    env:node.chef_environment,
  })
  notifies :run, 'execute[bundle-install-jupiter]', :immediately
end

template "/etc/logrotate.d/jupiter" do
  source 'logrotate.erb'
  user 'root'
  group 'root'
  mode '0644'
  variables ({
    app_name:'jupiter',
    log_dir:"/home/#{node[:current_user]}/#{node.chef_environment}/jupiter/log",
  })
end

template "/home/#{node[:current_user]}/#{node.chef_environment}/jupiter/config/newrelic.yml" do
  source 'newrelic.yml.erb'
  user node[:current_user]
  group node[:current_user]
  variables ({
    app_name:'Jupiter',
    log_dir:"/home/#{node[:current_user]}/#{node.chef_environment}/jupiter/log",
    auto_instrument:true,
  })
end

execute "bundle-install-jupiter" do
  command "sudo bundle install"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}/jupiter"
  user node[:current_user]
  group node[:current_user]
  action :nothing
  notifies :run, 'execute[build-jupiter]', :immediately
end

execute "build-jupiter" do
  command "rake build:jupiter"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}"
  environment ({
    'LC_ALL'=>nil,
  })
  user node[:current_user]
  group node[:current_user]
  action :nothing
end

service 'jupiter' do
  action [:enable, :start]
end

