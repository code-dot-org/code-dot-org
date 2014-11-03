require 'sequel'

def sequel_connect(writer, reader)
  reader = reader.gsub 'mysql:', 'mysql2:'
  writer = writer.gsub 'mysql:', 'mysql2:'

  reader_uri = URI(reader)
  if reader_uri.host != URI(writer).host
    Sequel.connect writer, servers:{read_only:{host:reader_uri.host}}
  else
    Sequel.connect writer
  end
end

PEGASUS_DB = sequel_connect CDO.pegasus_db_writer, CDO.pegasus_db_reader
#PEGASUS_DB.loggers << $log if rack_env?(:development)

DASHBOARD_DB = sequel_connect CDO.dashboard_db_writer, CDO.dashboard_db_reader
#DASHBOARD_DB.loggers << $log if rack_env?(:development)
