require 'chefspec'
require 'chefspec/berkshelf'

describe 'cdo-awscli::default' do
  let :chef_run do
    ChefSpec::SoloRunner.new do |node|
      node.default['cdo-awscli'] = {
        access_key_id: 'abc',
        access_key_secret: 'def'
      }
    end.converge(described_recipe)
  end
  let(:node) {chef_run.node}

  it 'sets default but not backup' do
    file = "#{node[:home]}/.aws/config"
    expect(chef_run).to render_file(file).with_content('aws_access_key_id = abc')
    expect(chef_run).to render_file(file).with_content('[default]')
    expect(chef_run).to_not render_file(file).with_content('[backup]')
  end
end
