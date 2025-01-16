require 'uri'
require 'cdo/sequel'
require 'sequel'
require 'cdo/cache'
require pegasus_dir 'data/static_models'

# rubocop:disable CustomCops/PegasusDbUsage
PEGASUS_DB = Cdo::Sequel.database_connection_pool CDO.pegasus_db_writer, CDO.pegasus_db_reader
POSTE_DB = PEGASUS_DB
# Use Pegasus as the default database for Sequel Models.
Sequel::Model.db = PEGASUS_DB
PEGASUS_DB.singleton_class.prepend StaticModels
# rubocop:enable CustomCops/PegasusDbUsage

DASHBOARD_DB = Cdo::Sequel.database_connection_pool CDO.dashboard_db_writer, CDO.dashboard_db_reader

credentials = CDO.db_credential_reader
dashboard_reporting_connection_settings = URI::Generic.build(
  scheme: 'mysql',
  userinfo: credentials['username'] + ':' + credentials['password'],
  host: CDO.db_endpoint_proxy_reporting,
  port: CDO.db_endpoint_proxy_reporting_port,
  path: '/' + CDO.dashboard_db_name
)
DASHBOARD_REPORTING_DB_READER = Cdo::Sequel.database_connection_pool dashboard_reporting_connection_settings, dashboard_reporting_connection_settings
