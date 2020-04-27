describe command('rsyslogd -v') do
  its(:exit_status) {should eq 0}
  its(:stdout) {should match 'rsyslogd 8.37.0'}
end

describe command("logger hello123") do
  its(:exit_status) {should eq 0}
end

describe file('/var/log/syslog') do
  its(:content) {should match 'hello123'}
end

describe command('logger "$(head -c10k /dev/urandom | tr -dc A-Za-z0-9) hello456"; logger $(date)') do
  its(:exit_status) {should eq 0}
end

describe file('/var/log/syslog.1') do
  its(:content) {should match 'hello456'}
end
