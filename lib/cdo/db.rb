require 'sequel'
PEGASUS_DB = Sequel.connect(CDO.pegasus_db_writer.sub('mysql:', 'mysql2:'))
#PEGASUS_DB.loggers << $log if rack_env?(:development)
DASHBOARD_DB = Sequel.connect(CDO.dashboard_db_writer.sub('mysql:', 'mysql2:'))
#DASHBOARD_DB.loggers << $log if rack_env?(:development)
