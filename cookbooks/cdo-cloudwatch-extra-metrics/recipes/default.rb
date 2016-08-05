#
# Cookbook Name:: cdo-cloudwatch-extra-metrics
# Recipe:: default
#

apt_package ['libwww-perl', 'libdatetime-perl']

remote_file "#{Chef::Config[:file_cache_path]}/CloudWatchMonitoringScripts-1.2.1.zip" do
  source "http://aws-cloudwatch.s3.amazonaws.com/downloads/CloudWatchMonitoringScripts-1.2.1.zip"
end

execute "unzip #{Chef::Config[:file_cache_path]}/CloudWatchMonitoringScripts-1.2.1.zip" do
  command "unzip #{Chef::Config[:file_cache_path]}/CloudWatchMonitoringScripts-1.2.1.zip"
  cwd "/home/#{node[:current_user]}"
  creates "/home/#{node[:current_user]}/aws-scripts-mon"
end
