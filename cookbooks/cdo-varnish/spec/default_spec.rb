require 'chefspec'
require 'chefspec/berkshelf'

describe 'cdo-varnish' do
  let :chef_run do
    ChefSpec::SoloRunner.new do |node|
      node.automatic['memory']['total'] = "#{(memory * 1024 * 1024)}kB"
    end.converge(described_recipe)
  end
  let(:varnish_suffix) {'G'}
  let(:node) { chef_run.node }

  context '64gb' do
    let(:memory){64}
    it 'sets correct varnish memory' do
      expect(node['cdo-varnish']['storage']).to eq 'malloc,4.0G'
    end
  end

  context '8gb' do
    let(:memory){8}
    it 'sets correct varnish memory' do
      expect(node['cdo-varnish']['storage']).to eq 'malloc,0.5G'
    end
  end

end
