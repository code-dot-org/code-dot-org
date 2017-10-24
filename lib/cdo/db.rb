require 'sequel'

def sequel_connect(writer, reader)
  reader = reader.gsub 'mysql:', 'mysql2:'
  writer = writer.gsub 'mysql:', 'mysql2:'

  reader_uri = URI(reader)
  writer_uri = URI(writer)
  if reader_uri != writer_uri
    db = Sequel.connect writer,
      servers: {fallback: Sequel::Database.send(:uri_to_options, reader_uri)},
      encoding: 'utf8mb4',
      reconnect: true,
      connect_timeout: 2,
      default_group: 'cdo'
    db.extension :server_fallback
  else
    db = Sequel.connect writer,
      encoding: 'utf8mb4',
      reconnect: true,
      connect_timeout: 2,
      default_group: 'cdo'
  end

  db.extension :server_block

  # Uncomment this for Pegasus logging.  Only appears to work when started
  # using bin/pegasus-server.
  #db.loggers << $log if rack_env?(:development) && $log

  db
end

PEGASUS_DB = sequel_connect CDO.pegasus_db_writer, CDO.pegasus_reporting_db_reader
POSTE_DB = PEGASUS_DB
DASHBOARD_DB = sequel_connect CDO.dashboard_db_writer, CDO.dashboard_reporting_db_reader
