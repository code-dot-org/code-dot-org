require_relative '../src/env'
require 'rack/test'
require 'minitest/autorun'

class HourOfCodeHelpersTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  # Covers #hoc_canonicalized_i18n_path / #hoc_detect_country in helpers/hourofcode_helpers.rb
  def test_hourofcode_redirect
    header 'host', 'hourofcode.com'
    # 89.151.64.0 is the user's real address (Great Britain IP address range)
    # 54.240.158.170 is cloudfront
    # 10.31.164.34 is the load balancer or something
    header 'X_FORWARDED_FOR', '89.151.64.0, 54.240.158.170, 10.31.164.34'
    response = get '/xyz', {}, {'REMOTE_ADDR' => '54.240.158.170'}
    assert_equal 'http://hourofcode.com/uk/xyz', response.headers['Location']
  end
end
