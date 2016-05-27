require 'serverspec'
set :backend, :exec

def cmd(exec, match)
  describe command(exec) do
    its(:stdout) { should match match }
  end
end

# Simple full-stack integration test for now.
# Just ensure that Dashboard and Pegasus are both running, listening on their ports and responding to requests.
cmd 'curl localhost:8080', Regexp.escape('<title>Code.org [adhoc]</title>')
cmd 'curl localhost:8081', Regexp.escape('<title>Anybody can learn | Code.org</title>')
cmd 'curl -I localhost:8080', 'nginx'
