require_relative 'test_helper'
require 'cdo/rack/allowlist'

class CookieAllowlistTest < Minitest::Test
  include Rack::Test::Methods

  HEADERS = REMOVED_HEADERS.map {|x| x.split(':')[0]}.freeze
  COOKIE_CONFIG = {
    behaviors: [
      {
        path: '/all/*',
        cookies: 'all',
        headers: HEADERS
      },
      {
        path: '/some/*',
        cookies: %w(one two),
        headers: HEADERS
      }
    ],
    default: {cookies: 'none', headers: HEADERS}
  }.freeze

  def build_rack_mock_session
    @session ||= Rack::MockSession.new(app)
  end

  def app
    cookie_grabber = lambda do |env|
      @request_cookies = Rack::Request.new(env).cookies
      @request_env = env
      [200, {'Content-Type' => 'text/plain'}, ['OK']]
    end
    Rack::Builder.app do
      use Rack::Allowlist::Downstream, COOKIE_CONFIG
      run cookie_grabber
    end
  end

  def setup
    session = build_rack_mock_session
    session.set_cookie('one=1')
    session.set_cookie('two=2')
    session.set_cookie('three=3')
  end

  def test_allowlisted_cookies
    get '/some/'
    assert_nil @request_env['HTTP_COOKIE'].match(/three/)
    assert_equal @request_cookies, {'one' => '1', 'two' => '2'}
  end

  def test_no_cookies
    get '/none'
    assert_nil @request_env['HTTP_COOKIE']
    assert_equal @request_cookies, {}
  end

  def test_all_cookies
    get '/all/'
    refute_nil @request_env['HTTP_COOKIE'].match(/three/)
    assert_equal @request_cookies, {'one' => '1', 'two' => '2', 'three' => '3'}
  end
end
