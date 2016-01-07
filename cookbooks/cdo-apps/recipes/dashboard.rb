include_recipe 'cdo-apps::aws'
include_recipe 'cdo-varnish'

template "/etc/init.d/dashboard" do
  source 'init.d.erb'
  user 'root'
  group 'root'
  mode '0755'
  variables ({
    src_file: "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/config/unicorn.rb",
    app_root: "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard",
    pid_file: "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/config/unicorn.rb.pid",
    user: node[:current_user],
    env: node.chef_environment,
  })
  notifies :run, 'execute[bundle-install-dashboard]', :immediately
end

template "/etc/logrotate.d/dashboard" do
  source 'logrotate.erb'
  user 'root'
  group 'root'
  mode '0644'
  variables ({
    app_name: 'dashboard',
    log_dir: "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/log",
  })
end

template "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/config/newrelic.yml" do
  source 'newrelic.yml.erb'
  user node[:current_user]
  group node[:current_user]
  variables ({
    app_name: 'Dashboard',
    log_dir: "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/log",
    auto_instrument: false,
  })
end

link "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/public/blockly" do
  to "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/public/apps-package"
  action :create
  user node[:current_user]
  group node[:current_user]
end

link "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/public/shared" do
  to "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/public/shared-package"
  action :create
  user node[:current_user]
  group node[:current_user]
end

link "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/public/code-studio" do
  to "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard/public/code-studio-package"
  action :create
  user node[:current_user]
  group node[:current_user]
end

execute "bundle-install-dashboard" do
  command "sudo bundle install"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard"
  user node[:current_user]
  group node[:current_user]
  action :nothing
  notifies :run, "execute[#{node['cdo-apps']['local_mysql'] ? 'setup-dashboard-db' : 'build-dashboard'}]", :immediately
end

execute "setup-dashboard-db" do
  command "rake dashboard:setup_db"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard"
  environment ({
    'LC_ALL' => 'en_US.UTF-8', 'RAILS_ENV' => "#{node.chef_environment}"
  })
  user node[:current_user]
  group node[:current_user]
  action :nothing
  notifies :run, 'execute[build-dashboard]', :immediately
end

execute "build-dashboard" do
  command "rake build:dashboard"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}"
  environment ({
    'LC_ALL' => 'en_US.UTF-8', 'RAILS_ENV' => "#{node.chef_environment}"
  })
  user node[:current_user]
  group node[:current_user]
  action :nothing
end

service 'dashboard' do
  supports reload: true
  reload_command '/etc/init.d/dashboard upgrade'
  action [:enable, :start]

  # Restart Unicorn when Ruby is upgraded
  subscribes :restart, "apt_package[ruby#{node['cdo-ruby']['version']}]", :delayed
end
