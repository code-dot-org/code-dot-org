require 'minitest/autorun'
require 'rack/test'
require_relative '../../deployment'
require 'cdo/rack/whitelist_cookies'

ENV['RACK_ENV'] = 'test'

class CookieWhitelistTest < Minitest::Test
  include Rack::Test::Methods

  COOKIE_CONFIG = {
    behaviors: [
      {
        path: 'all/*',
        cookies: 'all'
      },
      {
        path: 'some/*',
        cookies: %w(one two)
      }
    ],
    default: {cookies: 'none'}
  }

  def build_rack_mock_session
    @session ||= Rack::MockSession.new(app)
  end

  def app
    cookie_grabber = lambda do |env|
      @request_cookies = Rack::Request.new(env).cookies
      [200, {'Content-Type' => 'text/plain'}, ['OK']]
    end
    Rack::Builder.app do
      use Rack::WhitelistCookies, COOKIE_CONFIG
      run cookie_grabber
    end
  end

  def setup
    session = build_rack_mock_session
    session.set_cookie('one=1')
    session.set_cookie('two=2')
    session.set_cookie('three=3')
  end

  def test_whitelisted_cookies
    get '/some/'
    assert_equal @request_cookies, {'one' => '1', 'two' => '2'}
  end

  def test_no_cookies
    get '/none'
    assert_equal @request_cookies, {}
  end

  def test_all_cookies
    get '/all/'
    assert_equal @request_cookies, {'one' => '1', 'two' => '2', 'three' => '3'}
  end
end
