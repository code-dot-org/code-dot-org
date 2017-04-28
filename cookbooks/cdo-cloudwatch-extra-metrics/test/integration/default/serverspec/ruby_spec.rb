require 'serverspec'
set :backend, :exec

def cmd(exec, match)
  describe command(exec) do
    its(:stdout) {should match match}
  end
end

# Ensure proper version of script is installed.
cmd '/usr/local/aws-scripts-mon/mon-put-instance-data.pl --version', 'CloudWatch-PutInstanceData version 1.2.1'
cmd '/usr/local/aws-scripts-mon/mon-put-instance-data.pl --mem-util --disk-space-util --disk-path=/ --verify', 'Verification completed successfully'
