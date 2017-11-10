describe 'pmm-admin' do
  it 'ping succeeds' do
    expect(command('pmm-admin ping').exit_status).to eq(0)
  end
  it 'check-network succeeds' do
    expect(command('pmm-admin check-network').exit_status).to eq(0)
  end
end
describe command('pmm-admin list') do
  its('stdout') {should match /mysql:queries.*YES/}
  its('stdout') {should match /linux:metrics.*YES/}
  its('stdout') {should match /mysql:metrics.*YES/}
end
