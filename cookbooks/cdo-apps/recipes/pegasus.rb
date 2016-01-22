include_recipe 'cdo-apps::aws'
include_recipe 'cdo-varnish'

template "/etc/init.d/pegasus" do
  source 'init.d.erb'
  user 'root'
  group 'root'
  mode '0755'
  variables ({
    src_file: "/home/#{node[:current_user]}/#{node.chef_environment}/pegasus/config/unicorn.rb",
    app_root: "/home/#{node[:current_user]}/#{node.chef_environment}/pegasus",
    pid_file: "/home/#{node[:current_user]}/#{node.chef_environment}/pegasus/config/unicorn.rb.pid",
    user: node[:current_user],
    env: node.chef_environment,
  })
  notifies :run, 'execute[bundle-install-pegasus]', :immediately
end

template "/etc/logrotate.d/pegasus" do
  source 'logrotate.erb'
  user 'root'
  group 'root'
  mode '0644'
  variables ({
    app_name: 'pegasus',
    log_dir: "/home/#{node[:current_user]}/#{node.chef_environment}/pegasus/log",
  })
end

template "/home/#{node[:current_user]}/#{node.chef_environment}/pegasus/config/newrelic.yml" do
  source 'newrelic.yml.erb'
  user node[:current_user]
  group node[:current_user]
  variables ({
    app_name: 'Pegasus',
    log_dir: "/home/#{node[:current_user]}/#{node.chef_environment}/pegasus/log",
    auto_instrument: true,
  })
end

execute "bundle-install-pegasus" do
  command "sudo bundle install"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}/pegasus"
  user node[:current_user]
  group node[:current_user]
  action :nothing
  notifies :run, "execute[#{node['cdo-apps']['local_mysql'] ? 'setup-pegasus-db' : 'build-pegasus'}]", :immediately
end

execute "setup-pegasus-db" do
  command "rake pegasus:setup_db"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}/pegasus"
  environment ({
    'LC_ALL' => 'en_US.UTF-8'
  })
  user node[:current_user]
  group node[:current_user]
  action :nothing
  notifies :run, 'execute[build-pegasus]', :immediately
end

execute "build-pegasus" do
  command "rake build:pegasus"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}"
  environment ({
    'LC_ALL' => 'en_US.UTF-8'
  })
  user node[:current_user]
  group node[:current_user]
  action :nothing
end

service 'pegasus' do
  supports reload: true
  reload_command '/etc/init.d/pegasus upgrade'
  action [:enable, :start]

  # Restart Unicorn when Ruby is upgraded
  subscribes :restart, "apt_package[ruby#{node['cdo-ruby']['version']}]", :delayed
end
