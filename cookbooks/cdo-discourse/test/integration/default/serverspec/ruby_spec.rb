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

file_exist '/var/discourse/launcher'
cmd 'curl localhost -H "Host: forum.code.org"', 'Discourse'
cmd 'curl localhost -H "Host: discourse.code.org"', 'Discourse'
