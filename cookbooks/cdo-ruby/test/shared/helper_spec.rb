require 'serverspec'
set :backend, :exec

def file_not_exist(file)
  describe file(file) do
    it {should_not exist}
  end
end

def file_exist(file)
  describe file(file) do
    it {should exist}
  end
end

def cmd(exec, match)
  describe command(exec) do
    its(:stdout) {should match match}
  end
end
