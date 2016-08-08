#
# Cookbook Name:: cdo-cloudwatch-extra-metrics
# Recipe:: default
#

apt_package ['unzip', 'libwww-perl', 'libdatetime-perl']

remote_file "#{Chef::Config[:file_cache_path]}/CloudWatchMonitoringScripts-1.2.1.zip" do
  source "http://aws-cloudwatch.s3.amazonaws.com/downloads/CloudWatchMonitoringScripts-1.2.1.zip"
  user node[:current_user]
  group node[:current_user]
end

execute "unzip #{Chef::Config[:file_cache_path]}/CloudWatchMonitoringScripts-1.2.1.zip" do
  command "unzip #{Chef::Config[:file_cache_path]}/CloudWatchMonitoringScripts-1.2.1.zip"
  user node[:current_user]
  group node[:current_user]
  cwd "/home/#{node[:current_user]}"
  creates "/home/#{node[:current_user]}/aws-scripts-mon"
end

aws_config = node['cdo-awscli']
template "/home/#{node[:current_user]}/aws-scripts-mon/awscreds.template" do
  not_if { aws_config.nil? }
  source 'awscreds.template.erb'
  variables(config: aws_config)
  user node[:current_user]
  group node[:current_user]
end
