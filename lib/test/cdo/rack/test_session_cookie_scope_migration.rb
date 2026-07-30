require_relative '../../test_helper'
require 'rack/utils'
require 'cdo/rack/session_cookie_scope_migration'

# The middleware rewrites HTTP_COOKIE to keep only the newest `_learn_session`
# cookie, recovering users left with two cookies after the brief `domain: nil`
# deploy. Duplicates are forged as a raw Cookie header (the only way to present
# two same-name cookies without a real multi-subdomain browser).
describe Rack::SessionCookieScopeMigration do
  COOKIE = '_learn_session'.freeze

  # Echoes the session id the downstream stack would read from HTTP_COOKIE.
  let(:app) do
    lambda do |env|
      [200, {}, [Rack::Request.new(env).cookies[COOKIE].to_s]]
    end
  end
  let(:middleware) {Rack::SessionCookieScopeMigration.new(app, cookie_name: COOKIE)}

  # Drive one request; return [rewritten HTTP_COOKIE, session id the app read].
  def call(cookie_header)
    env = Rack::MockRequest.env_for('/')
    env['HTTP_COOKIE'] = cookie_header if cookie_header
    _status, _headers, body = middleware.call(env)
    [env['HTTP_COOKIE'], body.first]
  end

  describe 'duplicate session cookies (stale first, fresh last)' do
    it 'keeps only the last (newest) occurrence, which the app then reads' do
      header, read = call("#{COOKIE}=stale; #{COOKIE}=fresh")
      _(header).must_equal "#{COOKIE}=fresh"
      _(read).must_equal 'fresh'
    end

    it 'preserves other cookies and their order' do
      header, = call("a=1; #{COOKIE}=stale; b=2; #{COOKIE}=fresh; c=3")
      _(header).must_equal "a=1; b=2; c=3; #{COOKIE}=fresh"
    end
  end

  describe 'a single session cookie' do
    it 'is left untouched' do
      header, read = call("#{COOKIE}=solo")
      _(header).must_equal "#{COOKIE}=solo"
      _(read).must_equal 'solo'
    end
  end

  describe 'duplicate non-session cookies' do
    it 'are left untouched' do
      header, = call('dupe=1; dupe=2')
      _(header).must_equal 'dupe=1; dupe=2'
    end
  end

  describe 'no cookies' do
    it 'passes through' do
      header, read = call(nil)
      _(header).must_be_nil
      _(read).must_equal ''
    end
  end
end
