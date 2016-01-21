#
# Cookbook Name:: cdo-repository
# Recipe:: default
#

include_recipe 'cdo-github-access'

template "/home/#{node[:current_user]}/.gemrc" do
  source 'gemrc.erb'
  user node[:current_user]
  group node[:current_user]
end

# Sync to the production or staging branch as appropriate.
adhoc = node.chef_environment == 'adhoc'
branch = adhoc ?
  (node['cdo-repository']['branch'] || 'staging') :
  node.chef_environment

git "/home/#{node[:current_user]}/#{node.chef_environment}" do
  if node['cdo-github-access'] && node['cdo-github-access']['id_rsa'] != ''
    repository 'git@github.com:code-dot-org/code-dot-org.git'
  else
    repository 'https://github.com/code-dot-org/code-dot-org.git'
  end

  depth 1 if node.chef_environment == 'adhoc'

  # No need to checkout 'staging' which is the default branch.
  enable_checkout (branch != 'staging')

  # Set the name of the local deploy branch to match the upstream.
  checkout_branch branch
  revision branch

  # Sync the local branch to the upstream branch.
  action :sync
  user node[:current_user]
  group node[:current_user]

  # Set the upstream branch to the appropriate origin.
  notifies :run, 'execute[select-upstream-branch]', :immediately
end

execute 'select-upstream-branch' do
  command "git branch --set-upstream-to=origin/#{branch} #{branch}"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}"
  action :nothing
end
