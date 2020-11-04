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
    req = Rack::Request.new({'HTTP_X_FORWARDED_FOR' => 'unknown'})
    assert_nil req.location
  end

  def test_saucelabs_ip
    # This override is hard-coded in cdo/geocoder.
    req = Rack::Request.new({'HTTP_X_FORWARDED_FOR' => '66.85.52.120'})
    assert_equal 'US', req.location.country_code
  end

  def test_gdpr
    assert Rack::Request.new('HTTP_CLOUDFRONT_VIEWER_COUNTRY' => 'gb').gdpr?
    refute Rack::Request.new('HTTP_CLOUDFRONT_VIEWER_COUNTRY' => 'us').gdpr?

    # If the CloudFront-Viewer-Country header is not set, IP-based geolocation is used as a fallback.
    user_ip = '89.151.64.0' # Great Britain IP address range
    Geocoder.stubs(:search).with(user_ip, {ip_address: true}).returns([OpenStruct.new(country_code: 'GB')])
    assert Rack::Request.new('REMOTE_ADDR' => user_ip).gdpr?
  end

  def test_x_forwarded_host
    request = Rack::Request.new(
      'HTTP_X_FORWARDED_HOST' => 'code.org',
      'HTTP_HOST' => 'hourofcode.com'
    )
    assert_equal 'hourofcode.com', request.site
  end
end
