require_relative '../../shared/test/test_helper'
require_relative '../../lib/cdo/rack/request'
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
        ['localhost.studio.code.org:3000', 'code.org'],
        ['localhost:3000', 'localhost'],
        ['3548dd72.ngrok.com', '3548dd72.ngrok.com'],
    ].each do |host, cookie_domain|
      req = Rack::Request.new({'HTTP_HOST' => host})
      assert_equal cookie_domain, req.shared_cookie_domain
    end
  end

  def test_unknown_ip
    stub_request(:get, "#{CDO.freegeoip_host || 'freegeoip.net'}/json/unknown").to_return(status: 404, body: '<html><title>404')
    req = Rack::Request.new({'HTTP_X_FORWARDED_FOR' => 'unknown'})
    assert_equal nil, req.location
  end
end
