#
# Cookbook Name:: cdo-cloudwatch-agent
# Recipe:: default
#

aws_cloudwatch_agent 'default' do
  action [:install]
end
