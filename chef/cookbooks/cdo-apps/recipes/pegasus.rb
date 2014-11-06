include_recipe 'cdo-apps::aws'
include_recipe 'cdo-apps::varnish'

execute "bundle-install-pegasus" do
  command "bundle install"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}/pegasus"
  user node[:current_user]
  group node[:current_user]
end

template "/etc/init.d/pegasus" do
  source 'init.d.erb'
  user 'root'
  group 'root'
  mode '0755'
  variables ({
    src_file:"/home/#{node[:current_user]}/#{node.chef_environment}/pegasus/config/unicorn.rb",
    app_root:"/home/#{node[:current_user]}/#{node.chef_environment}/pegasus",
    pid_file:"/home/#{node[:current_user]}/#{node.chef_environment}/aws/pegasus_unicorn.rb.pid",
    user:node[:current_user],
    env:node.chef_environment,
  })
end

service 'pegasus' do
  action [:enable, :start]
end
