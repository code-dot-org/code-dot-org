describe command('aws --version') do
  its(:exit_status) {should eq 0}
  its(:stderr) {should match('aws-cli/1.15.81')}
end

# Basic AWS CLI connectivity check, based on
# https://stackoverflow.com/a/42241040/1810460; we don't actually care about
# caller identity here, it's just an arbitrary choice.
describe command('aws sts get-caller-identity') do
  its(:exit_status) {should eq 0}
  its(:stdout) {should match '"Account": "123456789012"'}
  its(:stdout) {should match '"UserId": "AR#####:#####"'}
  its(:stdout) {should match '"Arn": "arn:aws:sts::123456789012:assumed-role/role-name/role-session-name"'}
  its(:stderr) {should eq ''}
end
