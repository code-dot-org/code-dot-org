#
# Cookbook Name:: cdo-repository
# Recipe:: default
#

include_recipe "cdo-github-access"

git "/home/#{node[:current_user]}/#{node.chef_environment}" do
  repository 'git@github.com:code-dot-org/code-dot-org.git'
  action :checkout
  checkout_branch node.chef_environment
  user node[:current_user]
end

template "/home/#{node[:current_user]}/.gemrc" do
  source 'gemrc.erb'
  user node[:current_user]
  group node[:current_user]
end
