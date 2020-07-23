# Run two local mysql services in a read-write setup.

include_recipe 'cdo-mysql::repo'

mysql_client 'default' do
  package_name %w(mysql-client libmysqlclient-dev)
  action :create
end

# Create two mysql services, sharing the same data directory.
%w(writer reader).each do |id|
  reader = id == 'reader'
  endpoint = URI.parse(node['cdo-secrets']["db_#{id}"])
  mysql_service id do
    package_name 'mysql-server'
    data_dir '/data'
    bind_address '0.0.0.0'
    port endpoint.port
    initial_root_password endpoint.password
    version '5.7'
    action :create
  end

  mysql_config id do
    instance id
    source 'mysqld.erb'
    variables(
      server_id: reader ? '1' : '0',
      mysql_instance: id,
      read_only: reader
    )
    # Reader can start only when writer is stopped.
    notifies(:stop, 'mysql_service[writer]', :immediately) if reader
    notifies :start, "mysql_service[#{id}]", :immediately
    notifies :restart, "mysql_service[#{id}]", :immediately
    notifies(:start, 'mysql_service[writer]', :immediately) if reader
    action :create
  end
end
