require 'sequel'
require 'sequel/connection_pool/threaded'
require 'cdo/cache'
require pegasus_dir 'data/static_models'

# Enable symbol splitting of qualified identifiers for backwards compatibility.
Sequel.split_symbols = true
# Enable deprecated Dataset#and method for backwards compatibility.
Sequel::Database.extension :sequel_4_dataset_methods
# Enable string literals in dataset filtering methods for backwards compatibility.
Sequel::Database.extension :auto_literal_strings

# rubocop:disable CustomCops/PegasusDbUsage
PEGASUS_DB = sequel_connect CDO.pegasus_db_writer, CDO.pegasus_db_reader
POSTE_DB = PEGASUS_DB
# Use Pegasus as the default database for Sequel Models.
Sequel::Model.db = PEGASUS_DB
PEGASUS_DB.singleton_class.prepend StaticModels
# rubocop:enable CustomCops/PegasusDbUsage

DASHBOARD_DB = sequel_connect CDO.dashboard_db_writer, CDO.dashboard_db_reader
DASHBOARD_REPORTING_DB_READER = sequel_connect CDO.dashboard_reporting_db_reader, CDO.dashboard_reporting_db_reader
