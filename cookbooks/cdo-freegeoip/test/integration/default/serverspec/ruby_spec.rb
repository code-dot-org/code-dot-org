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

file_exist '/usr/local/bin/freegeoip'
cmd 'curl localhost/json/54.230.145.218', 'Washington'
