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

  def test_post_whitelist
    header 'host', 'code.org'
    # Ensure POST requests to Pegasus template paths return a 405 error by default.
    %w(
      /
      /learn
      /learn/beyond
    ).each do |path|
      assert_equal 405, post(path).status
    end

    # Ensure POST requests to whitelisted paths are allowed.
    assert_equal 200, post('/custom-certificates').status
  end
end
