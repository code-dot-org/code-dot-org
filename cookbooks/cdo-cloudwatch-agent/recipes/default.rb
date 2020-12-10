#
# Cookbook Name:: cdo-cloudwatch-agent
# Recipe:: default
#

aws_cloudwatch_agent 'default' do
  action      [:install, :configure, :restart]
  json_config 'amazon-cloudwatch-agent.json.erb'
end
