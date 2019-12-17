require 'sequel'
require 'sequel/connection_pool/threaded'
require 'cdo/cache'
require pegasus_dir 'data/static_models'
require 'dynamic_config/gatekeeper'

# Connects to database.  Uses the Sequel connection_validator:
#   http://sequel.jeremyevans.net/rdoc-plugins/files/lib/sequel/extensions/connection_validator_rb.html
# @param writer [String] Write conenction
# @param reader [String] Read connection
# @param validation_frequency [number] How often to validate the connection. If set to -1,
#   validate each time a request is made.
# @param query_timeout [number] The execution timeout for SELECT statements, in seconds.
def sequel_connect(writer, reader, validation_frequency: nil, query_timeout: nil, multi_statements: false)
  reader = reader.gsub 'mysql:', 'mysql2:'
  writer = writer.gsub 'mysql:', 'mysql2:'

  db_options = {
    encoding: 'utf8mb4',
    default_group: 'cdo',

    # Sequel connection-test setting.
    # If set to true, it automatically calls test_connection to make sure a connection can be made before returning a Database instance.
    # Defaults to true since v4.49.0, set to false for backwards compatibility.
    # See:
    # https://github.com/jeremyevans/sequel/blob/master/doc/release_notes/3.11.0.txt#L102-L107
    # https://github.com/jeremyevans/sequel/blob/master/doc/release_notes/4.49.0.txt#L23-L27
    test: false,

    # Sequel connection-pool settings:
    # See: https://github.com/jeremyevans/sequel/blob/5.9.0/lib/sequel/connection_pool/threaded.rb#L20-L24
    #
    # The maximum number of connections the connection pool will open (default 4).
    max_connections: 4,
    # The amount of seconds to wait to acquire a connection before raising a PoolTimeoutError (default 5).
    pool_timeout: 3,

    # `mysql_options` client options forwarded through the mysql2 adapter:
    # See: https://dev.mysql.com/doc/refman/5.7/en/mysql-options.html

    # `MYSQL_OPT_RECONNECT`: Enable or disable automatic reconnection to the server if the connection is found to have
    # been lost. Reconnect is off by default; this option provides a way to set reconnection behavior explicitly.
    # See https://dev.mysql.com/doc/refman/5.7/en/c-api-auto-reconnect.html
    reconnect: true,

    # `MYSQL_OPT_CONNECT_TIMEOUT`: The connect timeout in seconds.
    connect_timeout: 2,

    # `MYSQL_OPT_READ_TIMEOUT`: The timeout in seconds for each attempt to read from the server.
    # There are retries if necessary, so the total effective timeout value is three times the option value.
    # You can set the value so that a lost connection can be detected earlier than the TCP/IP Close_Wait_Timeout value of 10 minutes.
    #
    # NOTE: mysql2 reuses this variable as a query timeout without retry, so set it to the maximum query execution time.
    read_timeout: 30,

    # `MYSQL_OPT_WRITE_TIMEOUT`: The timeout in seconds for each attempt to write to the server.
    # There is a retry if necessary, so the total effective timeout value is two times the option value.
    write_timeout: 5
  }

  if query_timeout
    db_options[:read_timeout] = query_timeout
    db_options[:init_command] = "SET SESSION MAX_EXECUTION_TIME = #{query_timeout * 1000}"
  end

  if multi_statements
    # Configure connection with the MULTI_STATEMENTS flag set that allows multiple statements in one database call.
    db_options[:flags] = ::Mysql2::Client::MULTI_STATEMENTS
  end

  if (reader_uri = URI(reader)) != URI(writer) &&
    Gatekeeper.allows('pegasus_read_replica')

    db_options[:servers] = {read_only: Sequel::Database.send(:uri_to_options, reader_uri)}
  end
  db = Sequel.connect writer, db_options

  db.extension :server_block

  # Check if validation frequency is valid and then use it to specify how often to
  # verify the db connection
  if validation_frequency && (validation_frequency == -1 || validation_frequency > 0)
    db.extension(:connection_validator)
    db.pool.connection_validation_timeout = validation_frequency
  end

  # Uncomment this for Pegasus logging.  Only appears to work when started
  # using bin/pegasus-server.
  #db.loggers << $log if rack_env?(:development) && $log

  db
end

# Enable symbol splitting of qualified identifiers for backwards compatibility.
Sequel.split_symbols = true
# Enable deprecated Dataset#and method for backwards compatibility.
Sequel::Database.extension :sequel_4_dataset_methods
# Enable string literals in dataset filtering methods for backwards compatibility.
Sequel::Database.extension :auto_literal_strings

PEGASUS_DB = sequel_connect CDO.pegasus_db_writer, CDO.pegasus_db_reader
POSTE_DB = PEGASUS_DB
# Use Pegasus as the default database for Sequel Models.
Sequel::Model.db = PEGASUS_DB
PEGASUS_DB.singleton_class.prepend StaticModels

DASHBOARD_DB = sequel_connect CDO.dashboard_db_writer, CDO.dashboard_db_reader
DASHBOARD_REPORTING_DB_READER = sequel_connect CDO.dashboard_reporting_db_reader, CDO.dashboard_reporting_db_reader
