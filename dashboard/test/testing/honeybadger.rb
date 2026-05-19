require 'honeybadger'

Honeybadger.configure do |config|
  config.backend = :test
  # Prevents outbound HTTP requests.
  config.report_data = false
end
