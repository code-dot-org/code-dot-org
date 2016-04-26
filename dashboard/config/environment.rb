# Load the Rails application.
ENV['RAILS_ENV'] = ENV['RACK_ENV'] = 'adhoc'

require File.expand_path('../application', __FILE__)

# Force UTF-8 Encodings.
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

# Initialize the Rails application.
Dashboard::Application.initialize!
