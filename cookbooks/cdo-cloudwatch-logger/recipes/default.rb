#
# Cookbook Name:: cdo-cloudwatch-logger
# Recipe:: default
#

# Compiled from https://github.com/zendesk/cloudwatch-logger release v1.
ark 'cloudwatch-logger' do
  url 'https://cdo-dist.s3.amazonaws.com/cloudwatch-logger.tar.gz'
  has_binaries ['cloudwatch-logger']
end

fifo = '/var/log/cloudwatch'
cloudwatch_logger = '/usr/local/bin/cloudwatch-logger.sh'

file 'cloudwatch-logger' do
  path cloudwatch_logger
  content <<SH
#!/bin/bash
mkfifo #{fifo}
chown syslog: #{fifo}
(while true ; do cat #{fifo} ; done) | cloudwatch-logger -t #{node.environment}-syslog "$(hostname)-$$"
SH
  mode '0755'
end

poise_service 'cloudwatch-logger' do
  command cloudwatch_logger

  environment AWS_REGION: node[:ec2][:region] || node[:ec2][:placement_availability_zone][0...-1]
  subscribes :restart, 'file[cloudwatch-logger]', :delayed
  subscribes :restart, 'ark[cloudwatch-logger]', :delayed
end

file '99-cdo.conf' do
  path "/etc/rsyslog.d/#{name}"
  content <<RSYSLOG
# Format syslog message as JSON
module(load="mmjsonparse")
action(type="mmjsonparse")
template(name="json_syslog" type="list") {
  constant(value="{")
  constant(value="\\"@timestamp\\":\\"")    property(name="timereported" dateFormat="rfc3339")
  constant(value="\\",\\"host\\":\\"")       property(name="hostname")
  constant(value="\\",\\"severity\\":\\"")   property(name="syslogseverity-text")
  constant(value="\\",\\"facility\\":\\"")   property(name="syslogfacility-text")
  constant(value="\\",\\"syslog-tag\\":\\"") property(name="syslogtag")
  constant(value="\\",\\"program\\":\\"")     property(name="programname")
  constant(value="\\",")
  property(name="$!all-json" position.from="2")
  constant(value="\\n")
}

module(load="builtin:ompipe")
*.* action(type="ompipe" template="json_syslog" Pipe="#{fifo}")
RSYSLOG
end

service 'rsyslog' do
  subscribes :restart, 'file[99-cdo.conf]', :delayed
end
