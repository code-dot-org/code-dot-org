template 'globals' do
  path "/home/#{node[:current_user]}/#{node.chef_environment}/globals.yml"
  source 'globals.yml.erb'
  mode '0644'
  user node[:current_user]
  group node[:current_user]
end
