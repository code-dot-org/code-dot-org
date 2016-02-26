require 'serverspec'
set :backend, :exec

def file_exist(file)
  describe file(file) do
    it { should exist }
  end
end

def cmd(exec, match)
  describe command(exec) do
    its(:stdout) { should match match }
  end
end

file_exist '/usr/sbin/nginx'
cmd 'nginx -v 2>&1', 'nginx/1.9.11'
cmd 'curl localhost:8080', 'Hello world!'
