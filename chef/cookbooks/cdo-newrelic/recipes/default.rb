#
# Cookbook Name:: cdo-newrelic
# Recipe:: default
#

apt_repository 'newrelic' do
  uri 'http://apt.newrelic.com/debian/'
  distribution 'newrelic'
  components ['non-free']
  key 'https://download.newrelic.com/548C16BF.gpg'
end

apt_package 'newrelic-sysmond'

template '/etc/newrelic/nrsysmond.cfg' do
  source 'nrsysmond.cfg.erb'
  user 'root'
  group 'newrelic'
  mode '640'
  notifies :restart, "service[newrelic-sysmond]", :immediately
end

service 'newrelic-sysmond' do
  action [:start, :enable]
end
