#
# Cookbook Name:: cdo-awscli
# Recipe:: default
#

python_runtime '2' do
  # Workaround for https://github.com/poise/poise-python/issues/133
  get_pip_url 'https://github.com/pypa/get-pip/raw/f88ab195ecdf2f0001ed21443e247fb32265cabb/get-pip.py'
  pip_version '18.0'
end

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
