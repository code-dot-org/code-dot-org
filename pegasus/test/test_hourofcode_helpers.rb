require_relative '../src/env'
require 'rack/test'
require 'minitest/autorun'

class HourOfCodeHelpersTest < Minitest::Test
  include Rack::Test::Methods

  def build_rack_mock_session
    config_ru = File.absolute_path('../config.ru', __dir__)
    pegasus_app = Rack::Builder.parse_file(config_ru).first
    Rack::MockSession.new(pegasus_app, 'hourofcode.com')
  end

  def test_debug
    # 89.151.64.0 is the user's real address (Great Britain IP address range)
    # 54.240.158.170 is cloudfront
    # 10.31.164.34 is the load balancer or something
    header 'X_FORWARDED_FOR', '89.151.64.0, 54.240.158.170, 10.31.164.34'
    response = get '/xyz', {}, {'REMOTE_ADDR' => '54.240.158.170'}
    assert_equal 'http://hourofcode.com/uk/xyz', response.headers['Location']
  end
end
