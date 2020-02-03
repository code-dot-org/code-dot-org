require 'chefspec'
require 'chefspec/berkshelf'

describe 'cdo-apps::daemon_ssh' do
  let :chef_run do
    ChefSpec::SoloRunner.new(platform: 'ubuntu', version: '14.04') do |node|
      node.automatic['memory']['total'] = ""
      node.default['cdo-servers']['ssh-private-key'] = 'private key'
      node.default['cdo-servers']['ssh-key'] = 'public key'
      node.default['cdo-apps']['frontends'] = true
      node.default['cdo-apps']['daemon'] = true
    end.converge(described_recipe)
  end

  subject {chef_run}

  it 'adds SSH config files' do
    is_expected.to create_file('/.ssh/config').with(content: /server_access_key/)
    is_expected.to create_file('/.ssh/server_access_key').with(content: 'private key')
    is_expected.to create_file('/.ssh/server_access_key.pub').with(content: 'public key')
  end
end
