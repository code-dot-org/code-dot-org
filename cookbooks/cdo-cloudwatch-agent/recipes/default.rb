#
# Cookbook Name:: cdo-cloudwatch-agent
# Recipe:: default
#

aws_cloudwatch_agent 'default' do
  action [:install]
end

template 'amazon-cloudwatch-agent.json' do
  path "/opt/aws/amazon-cloudwatch-agent/etc"
  source "amazon-cloudwatch-agent.json.erb"
end
