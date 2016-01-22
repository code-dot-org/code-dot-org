require_relative '../src/env'
require 'rack/test'
require 'minitest/autorun'
require 'fakeweb'

class HourOfCodeHelpersTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  # Covers #hoc_canonicalized_i18n_path / #hoc_detect_country in helpers/hourofcode_helpers.rb
  def test_hourofcode_redirect
    user_ip = '89.151.64.0' # Great Britain IP address range
    cloudfront_ip = '54.240.158.170'
    local_load_balancer = '10.31.164.34'

    # The geocoder gem resolve the IP using freegeoip, this mocks the underlying HTTP request.
    FakeWeb.register_uri :get, "freegeoip.net/json/#{user_ip}",
      body: {ip: user_ip, country_code: 'GB'}.to_json

    header 'host', 'hourofcode.com'
    header 'X_FORWARDED_FOR', "#{user_ip}, #{cloudfront_ip}, #{local_load_balancer}"
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/uk/xyz', response.headers['Location']
  end
end
