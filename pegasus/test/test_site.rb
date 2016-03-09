require_relative '../src/env'
require 'rack/test'
require 'minitest/autorun'
require 'webmock/minitest'

# General purpose Pegasus site tester for incremental test coverage of the Router logic.
class SiteTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  # Ensure POST requests to the root are disabled.
  def test_post_root
    header 'host', 'code.org'
    response = post '/'
    assert_equal 404, response.status
  end

  # Ensure POST requests to whitelisted paths are allowed.
  def test_post_whitelist
    header 'host', 'code.org'
    response = post '/custom-certificates'
    assert_equal 200, response.status
  end
end
