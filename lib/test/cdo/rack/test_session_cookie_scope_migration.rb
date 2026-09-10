require_relative '../../test_helper'
require 'rack/mock'
require 'rack/request'
require 'cdo/rack/session_cookie_scope_migration'

describe Rack::SessionCookieScopeMigration do
  COOKIE = '_learn_session'.freeze

  let(:app) {->(_env) {[200, {}, []]}}
  let(:middleware) {Rack::SessionCookieScopeMigration.new(app, cookie_name: COOKIE)}

  # Run the middleware over a request carrying +cookie_header+ and return the
  # (mutated) env, so tests can inspect both the rewritten HTTP_COOKIE and what
  # Rack's own first-wins parser -- i.e. every downstream reader -- then sees.
  def process(cookie_header)
    env = Rack::MockRequest.env_for('/')
    env['HTTP_COOKIE'] = cookie_header if cookie_header
    middleware.call(env)
    env
  end

  def cookie_seen_downstream(env)
    Rack::Request.new(env).cookies[COOKIE]
  end

  describe 'duplicate session cookies (stale first, fresh last)' do
    it 'keeps only the last (newest) occurrence, so downstream reads it' do
      env = process("#{COOKIE}=stale; #{COOKIE}=fresh")
      _(env['HTTP_COOKIE']).must_equal "#{COOKIE}=fresh"
      _(cookie_seen_downstream(env)).must_equal 'fresh'
    end

    it 'preserves other cookies and their order' do
      env = process("a=1; #{COOKIE}=stale; b=2; #{COOKIE}=fresh; c=3")
      _(env['HTTP_COOKIE']).must_equal "a=1; b=2; c=3; #{COOKIE}=fresh"
    end
  end

  describe 'a single session cookie' do
    it 'leaves the header untouched, preserving cookie order' do
      env = process("a=1; #{COOKIE}=solo; b=2")
      _(env['HTTP_COOKIE']).must_equal "a=1; #{COOKIE}=solo; b=2"
      _(cookie_seen_downstream(env)).must_equal 'solo'
    end
  end

  # Ensure a cookieless request does not raise NoMethodError on nil.split.
  describe 'a request with no cookies' do
    it 'does not raise' do
      env = process(nil)
      _(env['HTTP_COOKIE']).must_be_nil
    end
  end
end
