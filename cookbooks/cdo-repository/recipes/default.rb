#
# Cookbook Name:: cdo-repository
# Recipe:: default
#

include_recipe "cdo-github-access"

template "/home/#{node[:current_user]}/.gemrc" do
  source 'gemrc.erb'
  user node[:current_user]
  group node[:current_user]
end

git "/home/#{node[:current_user]}/#{node.chef_environment}" do
  repository 'git@github.com:code-dot-org/code-dot-org.git'

  # Sync to the production or staging branch as appropriate.
  branch = (node.chef_environment == 'adhoc') ? 'staging' : node.chef_environment
  revision branch

  # It is not necessary to checkout the staging branch because we get it automatically
  # when cloning the repository.
  enable_checkout (branch != 'staging')

  # Set the name of the deploy branch to match the environment.
  checkout_branch branch

  # Sync the deploy branch to the environment branch.
  action :checkout
  user node[:current_user]

  # Set the upstream branch to the appropriate origin.
  notifies :run, "execute[select-upstream-branch]", :immediately
end

execute "select-upstream-branch" do
  branch = (node.chef_environment == 'adhoc') ? 'staging' : node.chef_environment
  command "git branch --set-upstream-to=origin/#{branch} #{branch}"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}"
  action :nothing
end
