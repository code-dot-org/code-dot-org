#
# Cookbook Name:: cdo-syslog
# Recipe:: default
#

include_recipe 'apt'
apt_repository 'rsyslog' do
  uri 'ppa:adiscon/v8-stable'
  distribution node['lsb']['codename']
  retries 3
end
apt_package %w(rsyslog) do
  action :upgrade
end

syslog_file = '/var/log/syslog'
syslog_size = node['cdo-syslog']['syslog_size']

script_path = '/usr/local/bin'
file 'rotate_syslog' do
  path "#{script_path}/#{name}"
  content <<BASH
#!/bin/sh
mv -f #{syslog_file} #{syslog_file}.1
BASH
  mode '0755'
end

file '50-default.conf' do
  path "/etc/rsyslog.d/#{name}"
  content <<RSYSLOG
# Log everything to a fixed-size syslog file.
$outchannel log_rotation, #{syslog_file}, #{syslog_size}, #{script_path}/rotate_syslog
*.* :omfile:$log_rotation
RSYSLOG
end

file '99-cdo.conf' do
  path "/etc/rsyslog.d/#{name}"
  action :delete
end

service 'rsyslog' do
  subscribes :restart, 'file[99-cdo.conf]', :delayed
  subscribes :restart, 'file[50-default.conf]', :delayed
  provider Chef::Provider::Service::Systemd
end
