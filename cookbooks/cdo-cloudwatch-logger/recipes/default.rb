#
# Cookbook Name:: cdo-cloudwatch-logger
# Recipe:: default
#

# Ensure 'aws logs push' command is available.
include_recipe 'cdo-awscli'

fifo = '/var/log/cloudwatch'
script_path = '/usr/local/bin'

file 'cloudwatch-logger' do
  path "#{script_path}/#{name}"
  content <<BASH
#!/bin/bash
FIFO=#{fifo}
[ -p "$FIFO" ] || mkfifo $FIFO
chown syslog: $FIFO
(while true ; do cat $FIFO ; done) | \
aws logs push \
  --log-group-name #{node.environment}-syslog \
  --log-stream-name "$(hostname)-$$" \
  --datetime-format '%Y-%m-%dT%H:%M:%S.%f' \
  #{node['cdo-cloudwatch-logger']['dry_run'] ? '--dry-run' : ''}
BASH
  mode '0755'
end

poise_service 'cloudwatch-logger' do
  command "#{script_path}/#{name}"
  user node[:user]
  subscribes :restart, 'file[cloudwatch-logger]', :delayed
end

include_recipe 'apt'
apt_repository 'rsyslog' do
  uri 'ppa:adiscon/v8-stable'
  distribution node['lsb']['codename']
  retries 3
end
apt_package %w(rsyslog rsyslog-mmjsonparse) do
  action :upgrade
end

syslog_file = '/var/log/syslog'
syslog_size = node['cdo-cloudwatch-logger']['syslog_size']

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
  content <<RSYSLOG
# Format syslog message as JSON.
module(load="mmjsonparse")
action(type="mmjsonparse")
template(name="json_syslog" type="list") {
  constant(value="{")
  constant(value="\\"@timestamp\\":\\"")     property(name="timereported" dateFormat="rfc3339")
  constant(value="\\",\\"host\\":\\"")       property(name="hostname")
  constant(value="\\",\\"severity\\":\\"")   property(name="syslogseverity-text")
  constant(value="\\",\\"facility\\":\\"")   property(name="syslogfacility-text")
  constant(value="\\",\\"tag\\":\\"")        property(name="syslogtag")
  constant(value="\\",\\"program\\":\\"")    property(name="programname")
  constant(value="\\",")
  property(name="$!all-json" position.from="2")
  constant(value="\\n")
}

# Pipe all messages to cloudwatch-logger fifo.
module(load="builtin:ompipe")
*.* action(type="ompipe" template="json_syslog" Pipe="#{fifo}")
RSYSLOG
end

service 'rsyslog' do
  subscribes :restart, 'file[99-cdo.conf]', :delayed
  subscribes :restart, 'file[50-default.conf]', :delayed
  provider Chef::Provider::Service::Systemd
end
