require 'serverspec'
set :backend, :exec

describe 'mysql::default' do
  describe package('mysql-server-5.6') do
    it {should be_installed}
  end

  describe service('mysql') do
    it {should be_enabled}
    it {should be_running}
  end
end
