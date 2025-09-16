require 'vcr'

VCR.configure do |config|
  config.cassette_library_dir = File.expand_path('../fixtures/vcr_cassettes', __dir__)
  config.hook_into :webmock
  config.default_cassette_options = {record: :once}
  config.allow_http_connections_when_no_cassette = true
end
