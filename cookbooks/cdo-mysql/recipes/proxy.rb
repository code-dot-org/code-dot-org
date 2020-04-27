# Configure ProxySQL integration.

# https://github.com/sysown/proxysql#ubuntu--debian
apt_repository "proxysql" do
  uri "http://repo.proxysql.com/ProxySQL/proxysql-2.0.x/#{node['lsb']['codename']}/"
  distribution nil
  components ['./']
  key "https://repo.proxysql.com/ProxySQL/repo_pub_key"
end

apt_package 'proxysql' do
  version '2.0.7'
  action :upgrade
end

# Recursively resolve CNAME entries to get the last-resolved domain.
def get_cname(domain)
  require 'resolv'
  Resolv::DNS.open do |dns|
    loop do
      domain = dns.getresource(domain, Resolv::DNS::Resource::IN::CNAME)&.name.to_s
    end
  end
rescue Resolv::ResolvError
  domain
end

writer = URI.parse(node['cdo-secrets']['db_writer'] || 'mysql2://root@localhost/')
writer.hostname = '127.0.0.1' if writer.hostname == 'localhost'
reader = URI.parse((node['cdo-secrets']['db_reader'] || writer).to_s)

# If this is an Aurora cluster, resolve instance-endpoint hostnames
# to help with instance auto-discovery.
if (is_aurora = !!node['cdo-secrets']['db_cluster_id'])
  [writer, reader].each {|server| server.host = get_cname(server.host)}
end

admin = URI.parse(node['cdo-mysql']['proxy']['admin'])
admin_opt_str = %w(user password host port).map {|x| "--#{x}=#{admin.send(x)}"}.join(' ')
mysql_admin = "mysql #{admin_opt_str}"

proxy_port = node['cdo-mysql']['proxy']['port']
data_dir = '/var/lib/proxysql'

template 'proxysql.cnf' do
  path "/etc/#{name}"
  source "#{name}.erb"
  variables(
    data_dir: data_dir,
    is_aurora: is_aurora,
    writer: writer,
    reader: reader,
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

# Run update_servers SQL using mysql client, then run LOAD if any rows are changed.
file "#{data_dir}/update_servers.sh" do
  owner 'proxysql'
  mode '0700'
  content <<BASH
#!/bin/bash
DIFF=$(#{mysql_admin} -rN <#{data_dir}/update_servers.sql 2>/dev/null)
if [ "$DIFF" -ne 0 ]; then
  #{mysql_admin} -e 'LOAD MYSQL SERVERS TO RUNTIME' 2>/dev/null
fi
BASH
end

# Configure ProxySQL scheduler to run update_servers every second.
# Load via MySQL admin interface because configuring scheduler from file is not supported.
execute 'proxysql-aurora-admin' do
  admin_sql = <<~SQL
    REPLACE INTO `scheduler` (id, interval_ms, filename) VALUES (1, 1000, "#{data_dir}/update_servers.sh");
    LOAD SCHEDULER TO RUNTIME;
    SAVE SCHEDULER TO DISK;
  SQL
  command "#{mysql_admin} -e '#{admin_sql}'"
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
