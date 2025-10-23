require 'vcr'

VCR.configure do |config|
  config.cassette_library_dir = Rails.root.join('test/fixtures/vcr_cassettes').to_s
  config.hook_into :webmock
  config.ignore_localhost = true
  config.allow_http_connections_when_no_cassette = true

  config.default_cassette_options = {
    record: :once,
  }

  config.before_record do |interaction|
    interaction.request.headers = {}
  end
end
