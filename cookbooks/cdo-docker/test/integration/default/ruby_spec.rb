describe package('docker-ce') do
  it {should be_installed}
end

describe service('docker') do
  it {should be_enabled}
  it {should be_running}
end

describe 'docker' do
  it 'connects' do
    expect(command('docker info').exit_status).to eq(0)
  end
end
