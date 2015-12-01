require 'minitest/autorun'
require 'rack/test'
ENV['RACK_ENV'] = 'test'
require_relative '../../deployment'

require_relative '../src/env'
require 'mocha/mini_test'

class HourOfCodeHelpersTest < Minitest::Test
  def pegasus_app
    config_ru = File.absolute_path('../config.ru', __dir__)
    Rack::Builder.parse_file(config_ru).first
  end

  include Rack::Test::Methods
  def build_rack_mock_session
    @session ||= Rack::MockSession.new(pegasus_app, 'localhost.code.org')
  end

  def test_debug
    build_rack_mock_session
    header 'host', 'hourofcode.com'

    # 89.151.64.0 is the user's real address (Great Britain IP address range)
    # 54.240.158.170 is cloudfront
    # 10.31.164.34 is the load balancer or something
    header 'X_FORWARDED_FOR', '89.151.64.0, 54.240.158.170, 10.31.164.34'
    response = get '/xyz', {}, {'REMOTE_ADDR' => '54.240.158.170'}
    assert_equal 'http://hourofcode.com/uk/xyz', response.headers['Location']
  end
end
