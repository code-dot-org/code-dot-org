#
# Cookbook Name:: cdo-awscli
# Recipe:: default
#

# Install AWS CLI, based on the instructions at:
# https://docs.aws.amazon.com/cli/v1/userguide/install-linux.html#install-linux-bundled

apt_package 'python2.7'

remote_file '/tmp/awscli-bundle.zip' do
  source "https://s3.amazonaws.com/aws-cli/awscli-bundle-#{node['cdo-awscli']['version']}.zip"
end

archive_file '/tmp/awscli-bundle.zip' do
  destination '/tmp/'
end

execute 'install AWS CLI' do
  cwd '/tmp/awscli-bundle'
  command '/usr/bin/python2.7 install -i /usr/local/aws -b /usr/local/bin/aws'
end

# Configure AWS CLI after installation

directory "#{node[:home]}/.aws"

template "#{node[:home]}/.aws/config" do
  source 'config.erb'
  user node[:user]
  group node[:user]
end
