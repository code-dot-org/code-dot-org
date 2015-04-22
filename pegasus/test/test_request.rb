require_relative '../../lib/cdo/rack/request'
require 'minitest/autorun'

class RequestTest < Minitest::Unit::TestCase
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
end
