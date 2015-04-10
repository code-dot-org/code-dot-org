#
# Cookbook Name:: cdo-awscli
# Recipe:: default
#

apt_package 'awscli'

directory "/home/#{node[:current_user]}/.aws"

template "/home/#{node[:current_user]}/.aws/config" do
  source 'config.erb'
  user node[:current_user]
  group node[:current_user]
end
