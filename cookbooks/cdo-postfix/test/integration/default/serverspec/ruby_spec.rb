require 'serverspec'
set :backend, :exec

describe 'postfix::default' do
  describe package('postfix') do
    it { should be_installed }
  end

  describe service('postfix') do
    it { should be_enabled }
  end

  describe command 'postfix status' do
    its(:exit_status) { should eq 0 }
  end
end
