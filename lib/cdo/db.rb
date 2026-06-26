require 'uri'
require 'cdo/sequel'
require 'sequel'
require 'cdo/cache'

DASHBOARD_DB = Cdo::Sequel.database_connection_pool CDO.dashboard_db_writer, CDO.dashboard_db_reader
