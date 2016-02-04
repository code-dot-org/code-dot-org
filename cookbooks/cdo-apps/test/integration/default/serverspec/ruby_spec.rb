require 'serverspec'
set :backend, :exec

def cmd(exec, match)
  describe command(exec) do
    its(:stdout) { should match match }
  end
end

cmd 'curl localhost:8080', 'Code.org'
