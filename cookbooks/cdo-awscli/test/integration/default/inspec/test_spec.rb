describe command('aws --version') do
  its(:exit_status) {should eq 0}
  its(:stderr) {should match('aws-cli/1.15.81')}
end

describe command('pip show awscli-cwlogs') do
  its(:exit_status) {should eq 0}
  its(:stdout) {should match('Version: 1.4.5')}
end

describe command("echo 'hello' | aws logs push --log-group-name test --log-stream-name test --dry-run") do
  its(:exit_status) {should eq 0}
  its(:stdout) {should eq("hello\n")}
  its(:stderr) {should match('cwlogs.push.publisher')}
end
