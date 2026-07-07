require 'uri'
require 'cdo/sequel'
require 'sequel'
require 'cdo/cache'

# rubocop:disable CustomCops/PegasusDbUsage
PEGASUS_DB = Cdo::Sequel.database_connection_pool CDO.pegasus_db_writer, CDO.pegasus_db_reader
POSTE_DB = PEGASUS_DB
# Use Pegasus as the default database for Sequel Models.
Sequel::Model.db = PEGASUS_DB
# rubocop:enable CustomCops/PegasusDbUsage

DASHBOARD_DB = Cdo::Sequel.database_connection_pool CDO.dashboard_db_writer, CDO.dashboard_db_reader
