require 'mysql2'
require 'json'
require_relative './cfn_response'

def lambda_handler(event:, context:)
  props = event['ResourceProperties']
  username = props['username']
  user_host = props['user_host']
  password = props['password']
  database_list = props['database_list']
  permissions = props['permissions']

  physical_resource_id = event['PhysicalResourceId']
  physical_resource_id ||= username

  mysql_client = Mysql2::Client.new(
    host: props['db_server_name'],
    username: props['db_admin_username'],
    password: props['db_admin_password'],
    read_timeout: 10,
    write_timeout: 10,
    connect_timeout: 10
  )

  case event['RequestType']
  when 'Create'
    create_or_update_sql_user(
      mysql_client: mysql_client,
      username: username,
      user_host: user_host,
      password: password,
      database_list: database_list,
      permissions: permissions
    )
  when 'Update'
    create_or_update_sql_user(
      mysql_client: mysql_client,
      username: username,
      user_host: user_host,
      password: password,
      database_list: database_list,
      permissions: permissions
    )
  when 'Delete'
    delete_sql_user(
      mysql_client: mysql_client,
      username: username,
      user_host: user_host
    )
  else
    raise 'Unsupported Resource Event type.'
  end
  CfnResponse.send(event, context, 'SUCCESS', physical_resource_id: physical_resource_id)
rescue StandardError => exception
  CfnResponse.send(event, context, 'FAILURE', message: exception.message)
ensure
  mysql_client.close
end

# Custom CloudFormation Resources don't support importing an existing Resource, so support updating existing
# SQL users even when the event type is `Create`.
def create_or_update_sql_user(mysql_client:, username:, user_host:, password:, database_list:, permissions:)
  results = []
  create_statement = <<-SQL
    CREATE USER IF NOT EXISTS '#{username}}'@'#{user_host}'
    IDENTIFIED WITH mysql_native_password
    BY '#{client.escape(password)}';
  SQL
  results << mysql_client.query(create_statement)

  update_password_statement = <<-SQL
    -- Update password if user already exists.
    ALTER USER '#{username}}'@'#{user_host}'
    IDENTIFIED WITH mysql_native_password
    BY '#{client.escape(password)}';
  SQL
  results << mysql_client.query(update_password_statement)

  # GRANT PRIVILEGES on all objects (tables, views, etc.) in each specified database (pegasus, dashboard, etc).
  # We don't yet support specifying a specific set of objects within a specific database because that would
  # make the arguments to this method more complex, and this is already an improvement over granting permission
  # to all tables in all databases (`*.*`).
  database_list.each do |database|
    grant_statement = <<-SQL
      GRANT
        #{permissions.join(',')}
      ON #{database}.*
      TO '#{username}'@'#{user_host}';
    SQL
    results << mysql_client.query(grant_statement)
  end
  return results
end

def delete_sql_user(mysql_client:, username:, user_host:)
  results = mysql_client.query("DROP USER IF EXISTS '#{username}'@'#{user_host}';")
  return results
end
