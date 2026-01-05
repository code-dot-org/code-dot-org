require 'honeybadger'

Honeybadger.configure do |config|
  # Prevents outbound HTTP requests.
  config.report_data = false
end
