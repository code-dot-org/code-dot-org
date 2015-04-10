include_recipe 'cdo-repository'
include_recipe 'cdo-secrets'
include_recipe 'cdo-postfix'

execute "bundle-install-aws" do
  command "sudo bundle install"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}/aws"
  user node[:current_user]
  group node[:current_user]
end
