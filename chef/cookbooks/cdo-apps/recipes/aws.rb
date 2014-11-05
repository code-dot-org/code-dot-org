include_recipe 'cdo-repository'
include_recipe 'cdo-secrets'

execute "bundle-install-aws" do
  command "bundle install"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}/aws"
  user node[:current_user]
  group node[:current_user]
end
