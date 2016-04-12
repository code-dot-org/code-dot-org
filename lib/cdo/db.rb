require 'sequel'

def sequel_connect(writer, reader)
  reader = reader.gsub 'mysql:', 'mysql2:'
  writer = writer.gsub 'mysql:', 'mysql2:'

  reader_uri = URI(reader)
  if reader_uri.host != URI(writer).host
    db = Sequel.connect writer, servers: {read_only: {host: reader_uri.host}}, encoding: 'utf8mb4'
  else
    db = Sequel.connect writer, encoding: 'utf8mb4'
  end

  db.extension :server_block

  # Uncomment this for Pegasus logging.  Only appears to work when started
  # using bin/pegasus-server.
  #db.loggers << $log if rack_env?(:development) && $log

  db
end

PEGASUS_DB = sequel_connect CDO.pegasus_db_writer, CDO.pegasus_db_reader
POSTE_DB = PEGASUS_DB
DASHBOARD_DB = sequel_connect CDO.dashboard_db_writer, CDO.dashboard_db_reader
