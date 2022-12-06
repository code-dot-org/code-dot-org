#
# Cookbook Name:: cdo-cloudwatch-agent
# Recipe:: default
#

aws_cloudwatch_agent 'install' do
  action [:install]
end

template 'amazon-cloudwatch-agent.json' do
  path "/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json"
  source "amazon-cloudwatch-agent.json.erb"
end

# Copy and modify logic from the :config action in the aws_cloudwatch Chef cookbook.
# The aws_cloudwatch Chef cookbook searches Standard Out from the Cloud Watch Agent's config-translator tool
# to verify that the input JSON configuration file we generated via ERB was valid.
# https://github.com/gp42/aws_cloudwatch/blob/0d324a15739e3700cf017bcff599dd6da53e331e/libraries/agent_installer.rb#L115-L132
# A recent change that Amazon made to the config-translator tool (cmd/config-translator/translator.go) results in this
# information being written to Standard Error instead:
# https://github.com/aws/amazon-cloudwatch-agent/compare/v1.247350.0...v1.247352.0#diff-028b81b5a43fcd35fb7f55829f899ae5ab854d4c214e36898e620699da6892ec
# We use `2>&1` to redirect Standard Error to Standard Out to be certain the input configuration file we generated
# via ERB is valid. This is important, because without a valid configuration file, the CloudWatch Agent uses an
# internal default configuration file, which would result in us losing (not publishing) certain Metrics and Logs to
# the AWS CloudWatch service.
script 'amazon-cloudwatch-agent-config-translator' do
  action :run
  interpreter "bash"

  JSON_PATH = '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json'.freeze
  AGENT_TOM_PATH = '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.toml'.freeze
  COMMON_PATH = '/opt/aws/amazon-cloudwatch-agent/etc/common-config.toml'.freeze

  code <<-EOH
    res="$(sudo /opt/aws/amazon-cloudwatch-agent/bin/config-translator --input #{JSON_PATH} --output #{AGENT_TOM_PATH} --mode auto --config #{COMMON_PATH} 2>&1)"
    echo "$res" | grep 'Valid Json input schema.'
    exit $?
  EOH
end

aws_cloudwatch_agent 'restart' do
  action [:restart]
end
