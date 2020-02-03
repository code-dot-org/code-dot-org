require 'chefspec'
require 'chefspec/berkshelf'

describe 'cdo-apps::default' do
  let :chef_overrides do
    {}
  end

  let :chef_run do
    stub_command("which gem && gem --version | grep -q '2.7.4'").and_return(true)
    stub_command('bundle check').and_return(true)
    ChefSpec::SoloRunner.new(platform: 'ubuntu', version: '14.04') do |node|
      node.automatic['memory']['total'] = "#{(8 * 1024 * 1024)}kB"
      node.automatic['cpu']['total'] = 32
      node.automatic['lsb']['codename'] = 'trusty'
      node.automatic[:home] = ENV['HOME']
      node.name node_name
      node.override.merge! chef_overrides
    end.converge(described_recipe)
  end

  let(:node_name) {'_default'}
  subject {chef_run.node}

  it 'does not include cdo-analytics' do
    is_expected.not_to include_recipe('cdo-analytics::default')
  end
  it 'does not include daemon_ssh' do
    is_expected.not_to include_recipe('cdo-apps::daemon_ssh')
  end

  context 'production-daemon' do
    let(:chef_overrides) do
      {
        'cdo-apps': {
          daemon: true,
          frontends: true
        },
        'cdo-servers': {}
      }
    end
    let(:node_name) {'production-daemon'}
    it 'includes cdo-analytics' do
      is_expected.to include_recipe('cdo-analytics::default')
    end
    it 'includes daemon_ssh' do
      is_expected.to include_recipe('cdo-apps::daemon_ssh')
    end
  end
end
