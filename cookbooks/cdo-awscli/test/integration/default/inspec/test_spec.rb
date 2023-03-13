describe command('aws --version') do
  its(:exit_status) {should eq 0}
  its(:stderr) {should match('aws-cli/1.15.81')}
end

describe file('/root/.aws/config') do
  its('content') {should match "region = us-east-1"}
  its('content') {should match "metadata_service_num_attempts = 3"}
  its('content') {should match "metadata_service_timeout = 5"}
end
