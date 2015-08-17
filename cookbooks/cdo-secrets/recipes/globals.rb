template "/home/#{node[:current_user]}/#{node.chef_environment}/globals.yml" do
  source 'globals.yml.erb'
  mode '0644'
  user node[:current_user]
  group node[:current_user]
end
