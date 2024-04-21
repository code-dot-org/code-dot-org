# Configure ProxySQL integration.

# https://github.com/sysown/proxysql#ubuntu--debian
# apt_repository "proxysql" do
#   uri "http://repo.proxysql.com/ProxySQL/proxysql-2.0.x/#{node['lsb']['codename']}/"
#   distribution nil
#   components ['./']
#   key "https://repo.proxysql.com/ProxySQL/repo_pub_key"
# end
#
# apt_package 'proxysql' do
#   version '2.0.7'
#   action :upgrade
# end

# Use patched ProxySQL with fix for Aurora 2.09 bug.
# See: https://github.com/sysown/proxysql/issues/3082
# Can we stop using the fork? Our patch was merged upstream https://github.com/sysown/proxysql/pull/3234
proxysql_filename = 'proxysql_2.6.2-ubuntu20_amd64.deb'
proxysql_file = "#{Chef::Config[:file_cache_path]}/#{proxysql_filename}"
remote_file proxysql_file do
  source "https://github.com/sysown/proxysql/releases/download/v2.6.2/#{proxysql_filename}"
  checksum "bd4e4bf310927789d387341160c5a44b74d5fa0cd3d65783d40a75dd983791e1"
  action :create_if_missing
end
dpkg_package('proxysql') do
  source proxysql_file
  version '2.6.2'
  options '--force-confold'
end

writer = URI.parse(node['cdo-secrets']['db_writer'] || 'mysql2://root@localhost/')
writer.hostname = '127.0.0.1' if writer.hostname == 'localhost'
reader = URI.parse((node['cdo-secrets']['db_reader'] || writer).to_s)

admin = URI.parse(node['cdo-mysql']['proxy']['admin'])
admin_opt_str = %w(user host port).map {|x| "--#{x}=#{admin.send(x)}"}.join(' ')
# Set password via named pipe (requires Bash) to suppress password-warning message on stderr.
admin_password = "--defaults-extra-file=<(printf \"[client]\\npassword=#{admin.password}\")"
mysql_admin = "mysql #{admin_password} #{admin_opt_str}"

proxy_port = node['cdo-mysql']['proxy']['port']
data_dir = '/var/lib/proxysql'

template 'proxysql.cnf' do
  path "/etc/#{name}"
  source "#{name}.erb"
  variables(
    mysql_servers: [
      {writer => [0, 1, 2]},
      {reader => [1, 2]}
    ],
    data_dir: data_dir,
    is_aurora: true, # All environments that have ProxySQL enabled used Aurora.
    admin: admin,
    port: proxy_port
  )
end

# Proxysql reads persisted configuration from disk instead of configuration file if present.
# Remove persisted configuration on any changes to ensure full reload.
file "#{data_dir}/proxysql.db" do
  action :nothing
  subscribes :delete, 'template[proxysql.cnf]', :immediately
end

service 'proxysql' do
  supports status: true, restart: true
  action [:enable, :start]
  subscribes :restart, 'template[proxysql.cnf]', :immediately
  notifies :run, 'execute[proxysql-aurora-admin]', :immediately
end

# SQL script to update fallback-servers within hostgroups through MySQL admin interface.
cookbook_file "update_servers.sql" do
  path "#{data_dir}/#{name}"
  owner 'proxysql'
end

cookbook_file "diff.sql" do
  path "#{data_dir}/#{name}"
  owner 'proxysql'
end

# Run update_servers SQL using mysql client, then run LOAD if any rows are changed.
file "#{data_dir}/update_servers.sh" do
  owner 'proxysql'
  mode '0700'
  content <<~BASH
    #!/bin/bash -e

    DIFF=$(#{mysql_admin} -rN <#{data_dir}/diff.sql)
    if [ "$DIFF" -ne 0 ]; then
      #{mysql_admin} -e 'SAVE MYSQL SERVERS FROM RUNTIME'
    fi

    #{mysql_admin} -rN < #{data_dir}/update_servers.sql

    DIFF=$(#{mysql_admin} -rN <#{data_dir}/diff.sql)
    if [ "$DIFF" -ne 0 ]; then
      #{mysql_admin} -e 'LOAD MYSQL SERVERS TO RUNTIME'
    fi
  BASH
end

# Configure ProxySQL scheduler to run update_servers every second.
# Load via MySQL admin interface because configuring scheduler from file is not supported.
execute 'proxysql-aurora-admin' do
  environment SQL: <<~SQL
    REPLACE INTO `scheduler` (id, interval_ms, filename) VALUES (1, 1000, "#{data_dir}/update_servers.sh");
    LOAD SCHEDULER TO RUNTIME;
    SAVE SCHEDULER TO DISK;
  SQL
  command "bash -c '#{mysql_admin} -e \"$SQL\"'"
  action :nothing
  retries 3
  sensitive true
end

# Override application config to use proxy endpoint for DB reads and writes.
node.override['cdo-secrets']['db_writer'] = writer.dup.tap {|r| r.hostname = '127.0.0.1'; r.port = proxy_port}.to_s
node.override['cdo-secrets']['db_reader'] = reader.dup.tap {|r| r.hostname = '127.0.0.1'; r.port = proxy_port}.to_s

node.override['cdo-secrets']['db_proxy_admin'] = admin.to_s
# Send log to CloudWatch.
node.default['cdo-cloudwatch-agent']['log_files']['proxysql'] = '/var/lib/proxysql/proxysql.log'
