default['cdo-cloudwatch-agent'] = {
  log_files: {
    amazon_cloudwatch_agent: '/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log',
    syslog: %W[/var/log/syslog #{node[:home]}/#{node.chef_environment}/dashboard/logs/puma_stdout.log #{node[:home]}/#{node.chef_environment}/dashboard/logs/puma_stderr.log]
  }
}
