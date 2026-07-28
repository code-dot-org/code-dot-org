require_relative '../../test_helper'
require 'rack/utils'
require 'cdo/rack/session_cookie_scope_migration'

# Hotfix middleware: keep the newest `_learn_session` cookie and expire the
# stale host-only one, recovering users left with two cookies after the brief
# `domain: nil` deploy. Duplicates are forged as a raw Cookie header (the only
# way to present two same-name cookies without a real multi-subdomain browser).
describe Rack::SessionCookieScopeMigration do
  COOKIE = '_learn_session'.freeze

  # Mirrors the current config: the store writes the WILDCARD cookie when a
  # session is present, and echoes the id the downstream stack read.
  let(:app) do
    lambda do |env|
      read = Rack::Request.new(env).cookies[COOKIE]
      headers = {}
      headers['Set-Cookie'] = "#{COOKIE}=#{read}; path=/; HttpOnly; domain=.code.org" if read
      [200, headers, [read.to_s]]
    end
  end
  let(:middleware) {Rack::SessionCookieScopeMigration.new(app, cookie_name: COOKIE)}

  def call(cookie_header)
    env = Rack::MockRequest.env_for('/', 'HTTP_HOST' => 'studio.code.org')
    env['HTTP_COOKIE'] = cookie_header if cookie_header
    status, headers, body = middleware.call(env)
    [status, headers, body, env]
  end

  def set_cookies(headers)
    Array(headers['Set-Cookie']).flat_map {|h| h.split("\n")}
  end

  describe 'duplicate cookies (stale host-only first, fresh wildcard last)' do
    let(:header) {"#{COOKIE}=stale; #{COOKIE}=fresh"}

    it 'keeps the last (newest) cookie on read' do
      _, _, body, env = call(header)
      _(env['HTTP_COOKIE']).must_equal "#{COOKIE}=fresh"
      _(body.first).must_equal 'fresh'
    end

    it 'expires the stale host-only cookie with a no-Domain deletion' do
      _, headers, = call(header)
      deletion = set_cookies(headers).find {|c| c.start_with?("#{COOKIE}=;")}
      _(deletion).wont_be_nil
      _(deletion).must_include 'max-age=0'
      _(deletion).wont_include 'domain=' # host-only: must never name .code.org
    end

    it 'does not clobber the wildcard cookie the store just wrote' do
      _, headers, = call(header)
      store_write = set_cookies(headers).find {|c| c.start_with?("#{COOKIE}=fresh")}
      _(store_write).wont_be_nil
      _(store_write).must_include 'domain=.code.org'
    end
  end

  describe 'a single cookie' do
    it 'is left untouched, with no deletion emitted' do
      _, headers, _body, env = call("#{COOKIE}=solo")
      _(env['HTTP_COOKIE']).must_equal "#{COOKIE}=solo"
      _(set_cookies(headers).any? {|c| c.include?('max-age=0')}).must_equal false
    end
  end

  describe 'no cookies' do
    it 'passes through cleanly' do
      status, _headers, _body, env = call(nil)
      _(status).must_equal 200
      _(env['HTTP_COOKIE']).must_be_nil
    end
  end
end
