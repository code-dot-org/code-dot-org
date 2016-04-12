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
