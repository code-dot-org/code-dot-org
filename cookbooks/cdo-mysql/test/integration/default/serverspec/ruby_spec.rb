require 'serverspec'
set :backend, :exec

def cmd(exec, match)
  describe command(exec) do
    its(:stdout) {should match match}
  end
end

describe 'mysql::default' do
  describe package('mysql-server') do
    it {should be_installed}
  end

  describe service('mysql') do
    it {should be_enabled}
    it {should be_running}
  end

  version = '5.7'
  cmd 'echo "select version()" | mysql -u root -N', /^#{Regexp.escape(version)}/
end
