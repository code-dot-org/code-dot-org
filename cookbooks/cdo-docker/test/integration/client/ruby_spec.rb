describe package('docker-ce') do
  it {should be_installed}
end

describe 'docker' do
  it 'connects' do
    expect(command('docker info').exit_status).to eq(0)
  end
end
