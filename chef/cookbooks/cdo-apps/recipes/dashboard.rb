include_recipe 'cdo-apps::aws'
include_recipe 'cdo-apps::varnish'

execute "bundle-install-dashboard" do
  command "sudo bundle install"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard"
  user node[:current_user]
  group node[:current_user]
end

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
end

#execute "precompile-dashboard-assets" do
#  command "bundle exec rake assets:precompile"
#  cwd "/home/#{node[:current_user]}/#{node.chef_environment}/dashboard"
#  user node[:current_user]
#  group node[:current_user]
#  environment ({
#    'RAILS_ENV'=>node.chef_environment,
#    'LANG'=>'en_US.UTF-8',
#  })
#end

service 'dashboard' do
  action [:enable, :start]
end
