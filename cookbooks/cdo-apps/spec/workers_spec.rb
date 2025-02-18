require 'chefspec'
require 'chefspec/berkshelf'

def run_test(context, cpu, memory, dashboard_workers, pegasus_workers)
  context context do
    let(:cpu) {cpu}
    let(:memory) {memory}
    it 'sets correct number of workers' do
      expect(node['cdo-secrets']['dashboard_workers']).to eq dashboard_workers
      expect(node['cdo-secrets']['pegasus_workers']).to eq pegasus_workers
    end
  end
end

describe 'cdo-apps::workers' do
  let :chef_run do
    ChefSpec::SoloRunner.new(platform: 'ubuntu', version: '14.04') do |node|
      node.automatic['memory']['total'] = "#{memory * 1024 * 1024}kB"
      node.automatic['cpu']['total'] = cpu
    end.converge(described_recipe)
  end
  let(:node) {chef_run.node}

  # Test various cpu/ram configurations and the number of workers calculated
  #        context          cpu mem dash peg
  run_test 'cpu-bound',     32, 64, 32,  16
  run_test 'memory-bound',  32,  8,  6,   3
  # staging server
  run_test 'c3.2xlarge',     8, 15,  8,   4
  # ccpu-bound front-end
  run_test 'c3.8xlarge',    32, 60, 32,  16
  # memory-bound next-gen front-end (with current conservative calculations)
  run_test 'c4.8xlarge',    36, 60, 33,  16

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
