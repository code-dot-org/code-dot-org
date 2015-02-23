directory "/home/#{node[:current_user]}/#{node.chef_environment}/aws/secrets" do
  mode '0755'
  recursive true
  user node[:current_user]
  group node[:current_user]
end

template "/home/#{node[:current_user]}/#{node.chef_environment}/aws/secrets/config.yml" do
  source 'config.yml.erb'
  mode '0644'
  user node[:current_user]
  group node[:current_user]
end
