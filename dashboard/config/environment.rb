# Load the Rails application.
last_time = Time.now
require File.expand_path('../application', __FILE__)
$stderr.puts "required application in #{(Time.now - last_time).to_i} seconds"

# Force UTF-8 Encodings.
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

last_time = Time.now

# Explicitly load the abstract_mysql_adapter.  This is required when
# loading a cached schema dump.
require 'active_record/connection_adapters/abstract_mysql_adapter'
$stderr.puts "required active_record/connection_adapters/abstract_mysql_adapter in #{(Time.now - last_time).to_i} seconds"
last_time = Time.now

# Initialize the Rails application.
Dashboard::Application.initialize!
$stderr.puts "called Dashboard::Application.initialize! in #{(Time.now - last_time).to_i} seconds"
