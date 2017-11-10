require 'chefspec'
require 'chefspec/berkshelf'

describe 'cdo-apps::pmm' do
  let :chef_run do
    ChefSpec::SoloRunner.new(platform: 'ubuntu', version: '14.04') do |node|
      node.override['cdo-apps']['daemon'] = daemon
    end.converge(described_recipe)
  end
  let(:node) {chef_run.node}

  context 'daemon' do
    let(:daemon) {true}
    it 'enables pmm' do
      expect(node['cdo-apps']['pmm_enabled']).to eq(true)
    end
  end

  context 'non-daemon' do
    let(:daemon) {false}
    it 'does not enable pmm' do
      expect(node['cdo-apps']['pmm_enabled']).to eq(false)
    end
  end
end
