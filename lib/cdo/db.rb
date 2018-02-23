require 'sequel'
require 'sequel/connection_pool/threaded'

def sequel_connect(writer, reader, validation_frequency = nil)
  reader = reader.gsub 'mysql:', 'mysql2:'
  writer = writer.gsub 'mysql:', 'mysql2:'

  reader_uri = URI(reader)
  db =
    if reader_uri.host != URI(writer).host
      Sequel.connect writer, servers: {read_only: {host: reader_uri.host}}, encoding: 'utf8mb4', default_group: 'cdo'
    else
      Sequel.connect writer, encoding: 'utf8mb4', default_group: 'cdo'
    end

  db.extension :server_block

  # Check if validation frequency is valid and then use it to specify how often to
  # verify the db connection
  if !validation_frequency.nil? && (validation_frequency == -1 || validation_frequency > 0)
    db.extension(:connection_validator)
    db.connection_validation_timeout = validation_frequency
  end

  # Uncomment this for Pegasus logging.  Only appears to work when started
  # using bin/pegasus-server.
  #db.loggers << $log if rack_env?(:development) && $log

  db
end

PEGASUS_DB = sequel_connect CDO.pegasus_db_writer, CDO.pegasus_db_reader
POSTE_DB = PEGASUS_DB
DASHBOARD_DB = sequel_connect CDO.dashboard_db_writer, CDO.dashboard_db_reader
