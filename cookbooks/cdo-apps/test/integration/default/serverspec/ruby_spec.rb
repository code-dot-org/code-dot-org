require 'serverspec'
set :backend, :exec

def cmd(exec, match)
  describe command(exec) do
    its(:stdout) { should match match }
  end
end

cmd 'curl localhost:8080', Regexp.escape('<title>Code.org [adhoc]</title>')
cmd 'curl localhost:8081', Regexp.escape('<title>Anybody can learn | Code.org</title>')
