# Apply relevant change from https://github.com/rsyslog/rsyslog-pkg-ubuntu/pull/93 since it hasn't been merged upstream yet.

cookbook_file '/usr/lib/tmpfiles.d/00rsyslog.conf' do
  source '00rsyslog.conf'
  owner 'root'
  group 'root'
  mode '0644'
end
