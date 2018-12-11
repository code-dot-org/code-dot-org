require_relative './test_helper'
require 'webmock/minitest'

class HourOfCodeHelpersTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  # Covers #hoc_canonicalized_i18n_path / #hoc_detect_country / #hoc_detect_language in helpers/hourofcode_helpers.rb
  def test_hourofcode_redirect
    gb_ip = '89.151.64.0' # Great Britain IP address range
    fr_ip = '176.31.96.198' # France IP address range
    cloudfront_ip = '54.240.158.170' # Whitelisted CloudFront-ip proxy range
    local_load_balancer = '10.31.164.34' # Private-network address range

    # The geocoder gem resolves the IP using freegeoip, this mocks the underlying HTTP request.
    stub_request(:get, "#{CDO.freegeoip_host || 'freegeoip.io'}/json/#{gb_ip}").to_return(
      body: {ip: gb_ip, country_code: 'GB'}.to_json
    )
    stub_request(:get, "#{CDO.freegeoip_host || 'freegeoip.io'}/json/#{fr_ip}").to_return(
      body: {ip: fr_ip, country_code: 'FR'}.to_json
    )

    header 'host', 'hourofcode.com'
    header 'X_FORWARDED_FOR', [gb_ip, cloudfront_ip, local_load_balancer].join(', ')

    # GB geo, no browser language
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/uk/xyz', response.headers['Location']

    header 'ACCEPT_LANGUAGE', 'fr'
    # GB geo, French browser language
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/uk/fr/xyz', response.headers['Location']

    header 'X_FORWARDED_FOR', [fr_ip, cloudfront_ip, local_load_balancer].join(', ')
    # French geo, French browser language
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/fr/xyz', response.headers['Location']

    header 'ACCEPT_LANGUAGE', 'en'
    # French geo, English browser language
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/fr/xyz', response.headers['Location']

    header 'ACCEPT_LANGUAGE', 'it'
    # French geo, Italian browser language
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/fr/it/xyz', response.headers['Location']
  end

  # Ensure redirect goes to original (spoofable) IP-address location,
  # rather than the location of the first untrusted proxy in the forwarded chain.
  def test_redirect_untrusted_proxy
    user_ip = '89.151.64.0' # Great Britain IP address range
    untrusted_proxy_ip = '2.160.0.0' # Germany IP address range
    cloudfront_ip = '54.240.158.170' # Whitelisted CloudFront-ip proxy range
    local_load_balancer = '10.31.164.34' # Private-network address range

    # The geocoder gem resolves the IP using freegeoip, this mocks the underlying HTTP requests.
    stub_request(:get, "#{CDO.freegeoip_host || 'freegeoip.io'}/json/#{user_ip}").to_return(
      body: {ip: user_ip, country_code: 'GB'}.to_json
    )
    stub_request(:get, "#{CDO.freegeoip_host || 'freegeoip.io'}/json/#{untrusted_proxy_ip}").to_return(
      body: {ip: untrusted_proxy_ip, country_code: 'DE'}.to_json
    )

    header 'host', 'hourofcode.com'
    header 'X_FORWARDED_FOR', [user_ip, untrusted_proxy_ip, cloudfront_ip, local_load_balancer].join(', ')
    response = get '/xyz', {}, {'REMOTE_ADDR' => cloudfront_ip}
    assert_equal 'http://hourofcode.com/uk/xyz', response.headers['Location']

    # Canonical url formats shouldn't redirect.
    %w(
      /uk/xyz
      /uk/gb/xyz
      /afterschool/xyz
      /afterschool/en/xyz
    ).each do |path|
      response = get path
      assert_equal 404, response.status
    end

    # Redirect to /us/ by default when IP doesn't resolve to a country.
    header 'X_FORWARDED_FOR', "#{cloudfront_ip}, #{local_load_balancer}"
    response = get '/xyz'
    assert_equal 'http://hourofcode.com/us/xyz', response.headers['Location']
  end
end
