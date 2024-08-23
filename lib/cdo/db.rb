require 'cdo/sequel'
require 'sequel'
require 'cdo/cache'

DASHBOARD_DB = Cdo::Sequel.database_connection_pool ENV['DATABASE_URL'] || CDO.dashboard_db_writer, CDO.dashboard_db_reader
DASHBOARD_REPORTING_DB_READER = Cdo::Sequel.database_connection_pool CDO.dashboard_reporting_db_reader, CDO.dashboard_reporting_db_reader
