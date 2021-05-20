require 'serverspec'
set :backend, :exec

def cmd(exec, match)
  describe command(exec) do
    its(:stdout) {should match match}
  end
end

# Ensure proper version of agent is installed.
cmd '/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent --version', 'AmazonCloudWatchAgent v1.231221.0'
