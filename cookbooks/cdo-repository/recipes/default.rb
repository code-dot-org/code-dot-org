#
# Cookbook Name:: cdo-repository
# Recipe:: default
#
require 'etc'
include_recipe 'cdo-github-access'

template "/home/#{node[:current_user]}/.gemrc" do
  source 'gemrc.erb'
  user node[:current_user]
  group node[:current_user]
end

# Sync to the appropriate branch.
adhoc = node.chef_environment == 'adhoc'
branch = adhoc ?
  (node['cdo-repository']['branch'] || 'staging') :
  node.chef_environment

git_path = "/home/#{node[:current_user]}/#{node.chef_environment}"
git git_path do
  if node['cdo-github-access'] && node['cdo-github-access']['id_rsa'] != ''
    repository 'git@github.com:code-dot-org/code-dot-org.git'
  else
    repository 'https://github.com/code-dot-org/code-dot-org.git'
  end

  # Make adhoc checkouts as small as possible.
  depth 1 if node.chef_environment == 'adhoc'

  # Checkout at clone time, disable the additional checkout step.
  enable_checkout false
  checkout_branch branch
  revision branch

  # Sync the local branch to the upstream branch.
  action :sync
  user node[:current_user]
  group node[:current_user]
  # skip git-repo sync when running build within shared volume (where uid of git repo is different from current login).
  only_if { !::File.directory?(git_path) || ::File.stat(git_path).uid == Etc.getpwnam(Etc.getlogin).uid }
end
