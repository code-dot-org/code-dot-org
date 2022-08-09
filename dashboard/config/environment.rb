# Load the Rails application.
require File.expand_path('../application', __FILE__)

# Force UTF-8 Encodings.
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

# Explicitly load the abstract_mysql_adapter.  This is required when
# loading a cached schema dump.
require 'active_record/connection_adapters/abstract_mysql_adapter'

# Initialize the Rails application.
Dashboard::Application.initialize!

# overflow_activities was a backup table created on the production db, and not through
# the standard table creation process in rails. The table only exists on production
# and we won't be migrating it to other environments. However, it shouldn't belong in
# the schema, and we don't want it to show up when generating the schema on the prod
# database. This line will ignore that table.
# It also will ignore tables starting with an underscore, which are temporarily created
# when we use the gh-ost online migration tool to migrate large tables
# without significant downtime.
# Google_sheets_ tables are created from pegasus and since they have dynamic column definition
# from a CSV file, they are excluded from active record
ActiveRecord::SchemaDumper.ignore_tables = ['overflow_activities', /^_/, /^google_sheets_.*/]
