#
# Cookbook Name:: cdo-cloudwatch-extra-metrics
# Recipe:: default
#

apt_package ['unzip', 'libwww-perl', 'libdatetime-perl', 'rsync']

ark 'aws-scripts-mon' do
  url 'http://aws-cloudwatch.s3.amazonaws.com/downloads/CloudWatchMonitoringScripts-1.2.1.zip'
end
