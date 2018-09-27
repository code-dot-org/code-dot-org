#
# Cookbook Name:: cdo-awscli
# Recipe:: default
#

python_runtime '2'

python_package 'awscli' do
  version node['cdo-awscli']['version']
  action :upgrade
end

python_package 'awscli-cwlogs' do
  version node['cdo-awscli']['cwlogs_version']
  action :upgrade
end

directory "#{node[:home]}/.aws"

template "#{node[:home]}/.aws/config" do
  source 'config.erb'
  user node[:user]
  group node[:user]
end
