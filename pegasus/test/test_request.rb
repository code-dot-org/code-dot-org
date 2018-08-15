require_relative './test_helper'
require_relative '../../lib/cdo/rack/request'
require 'cdo/geocoder'
require 'geocoder'
require 'webmock/minitest'

class RequestTest < Minitest::Test
  def test_shared_cookie_domain
    [
      ['code.org', 'code.org'],
      ['studio.code.org', 'code.org'],
      ['test.code.org', 'code.org'],
      ['test.studio.code.org', 'code.org'],
      ['staging.code.org', 'code.org'],
      ['staging.studio.code.org', 'code.org'],
      ['localhost.code.org:3000', 'code.org'],
      ['localhost-studio.code.org:3000', 'code.org'],
      ['localhost:3000', 'localhost'],
      ['3548dd72.ngrok.com', '3548dd72.ngrok.com'],
    ].each do |host, cookie_domain|
      req = Rack::Request.new({'HTTP_HOST' => host})
      assert_equal cookie_domain, req.shared_cookie_domain
    end
  end

  def test_unknown_ip
    stub_request(:get, "#{CDO.freegeoip_host || 'freegeoip.io'}/json/unknown").to_return(status: 404, body: '<html><title>404')
    req = Rack::Request.new({'HTTP_X_FORWARDED_FOR' => 'unknown'})
    assert_nil req.location
  end

  def test_gdpr
    assert Rack::Request.new('HTTP_CLOUDFRONT_VIEWER_COUNTRY' => 'gb').gdpr?
    refute Rack::Request.new('HTTP_CLOUDFRONT_VIEWER_COUNTRY' => 'us').gdpr?

    # If the CloudFront-Viewer-Country header is not set, IP-based geolocation is used as a fallback.
    user_ip = '89.151.64.0' # Great Britain IP address range
    # The geocoder gem resolves the IP using freegeoip, this mocks the underlying HTTP requests.
    stub_request(:get, "#{CDO.freegeoip_host || 'freegeoip.io'}/json/#{user_ip}").to_return(
      body: {ip: user_ip, country_code: 'GB'}.to_json
    )
    assert Rack::Request.new('REMOTE_ADDR' => user_ip).gdpr?
  end
end
