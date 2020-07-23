require 'chefspec'
require 'chefspec/berkshelf'

def run_test(context, cpu, memory, dashboard_workers, pegasus_workers, varnish=0)
  context context do
    let(:cpu) {cpu}
    let(:memory) {memory}
    let(:varnish) {varnish}
    it 'sets correct number of workers' do
      expect(node['cdo-secrets']['dashboard_workers']).to eq dashboard_workers
      expect(node['cdo-secrets']['pegasus_workers']).to eq pegasus_workers
    end
  end
end

describe 'cdo-apps::workers' do
  let :chef_run do
    ChefSpec::SoloRunner.new(platform: 'ubuntu', version: '14.04') do |node|
      node.automatic['memory']['total'] = "#{(memory * 1024 * 1024)}kB"
      node.automatic['cpu']['total'] = cpu
      node.override['cdo-varnish']['storage'] = "malloc,#{varnish}#{varnish_suffix}"
    end.converge(described_recipe)
  end
  let(:varnish_suffix) {'G'}
  let(:varnish) {0}
  let(:node) {chef_run.node}

  # Test various cpu/ram/varnish configurations and the number of workers calculated
  #        context          cpu mem dash peg varn
  run_test 'cpu-bound',     32, 64, 32,  16
  run_test 'memory-bound',  32,  8,  6,   3
  run_test 'varnish-bound', 32,  8,  1,   1, 4
  # staging server
  run_test 'c3.2xlarge',     8, 15,  8,   4, 0.5
  # ccpu-bound front-end
  run_test 'c3.8xlarge',    32, 60, 32,  16, 4
  # memory-bound next-gen front-end (with current conservative calculations)
  run_test 'c4.8xlarge',    36, 60, 33,  16, 4

  context 'varnish mebibyte suffix' do
    let(:varnish_suffix) {'M'}
    run_test 'varnish using mebibytes', 32, 8, 4, 2, 1024
  end

  context 'varnish no suffix' do
    let(:varnish_suffix) {''}
    run_test 'varnish using bytes', 32, 8, 4, 2, 1024 * 1024 * 1024
  end

  context 'few CPUs' do
    let(:cpu) {2}
    let(:memory) {64}
    it 'disables image_optim' do
      expect(node['cdo-secrets']['image_optim']).to be false
    end
  end

  context 'high CPUs' do
    let(:cpu) {16}
    let(:memory) {64}
    it 'does not disable image_optim' do
      expect(node['cdo-secrets']['image_optim']).not_to be false
    end
  end
end
