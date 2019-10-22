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
reader = URI.parse((node['cdo-secrets']['db_reader'] || writer).to_s)

# If this is an Aurora cluster, resolve instance-endpoint hostnames
# to help with instance auto-discovery.
if (is_aurora = !!node['cdo-secrets']['db_cluster_id'])
  [writer, reader].each {|server| server.host = get_cname(server.host)}
end

admin = URI.parse(node['cdo-mysql']['proxy']['admin'])
proxy_port = node['cdo-mysql']['proxy']['port']

template 'proxysql.cnf' do
  path "/etc/#{name}"
  source 'proxysql.cnf.erb'
  variables(
    is_aurora: is_aurora,
    writer: writer,
    reader: reader,
    admin: admin,
    port: proxy_port
  )
end

# Proxysql reads persisted configuration from disk instead of configuration file if present.
# Remove persisted configuration on any changes to ensure full reload.
file '/var/lib/proxysql/proxysql.db' do
  action :nothing
  subscribes :delete, 'template[proxysql.cnf]', :immediately
end

service 'proxysql' do
  supports status: true, restart: true
  action [:enable, :start]
  subscribes :restart, 'template[proxysql.cnf]', :immediately
end

# Override application config to use proxy endpoint for DB reads and writes.
node.override['cdo-secrets']['db_writer'] = writer.dup.tap {|r| r.hostname = '127.0.0.1'; r.port = proxy_port}.to_s
node.override['cdo-secrets']['db_reader'] = reader.dup.tap {|r| r.hostname = '127.0.0.1'; r.port = proxy_port}.to_s
node.override['cdo-secrets']['db_proxy_admin'] = admin.to_s
