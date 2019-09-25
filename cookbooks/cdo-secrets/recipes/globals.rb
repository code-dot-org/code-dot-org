template 'globals' do
  path "#{node[:home]}/#{node.chef_environment}/globals.yml"
  source 'globals.yml.erb'
  mode '0644'
  user node[:current_user]
  group node[:current_user]
end
