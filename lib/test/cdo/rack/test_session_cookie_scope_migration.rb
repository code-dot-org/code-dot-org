require_relative '../../test_helper'
require 'rack/utils'
require 'cdo/rack/session_cookie_scope_migration'

# Exercises the transitional middleware that rolls the `_learn_session` cookie
# between domain-wide and host-only scope. The failure it guards against is a
# same-name duplicate cookie collision, easiest to reproduce by forging the raw
# Cookie header rather than driving a browser.
#
# `session_domain` mirrors the live session_store `:domain` option and drives
# which scope the middleware treats as stale. Default `nil` (host-only-writing
# config) is the forward migration, where the wildcard cookie is stale; the
# `:all` block below covers the rollback / current situation, where the
# host-only cookie is the stale one.
describe Rack::SessionCookieScopeMigration do
  COOKIE = '_learn_session'.freeze
  STUDIO_HOST = 'studio.code.org'.freeze

  # The session_store's live :domain option: nil (host-only) or :all (wildcard).
  let(:session_domain) {nil}
  # The Domain the stub session store writes its cookie under -- host-only (nil)
  # when session_domain is nil, `.code.org` when :all. Mirrors the real store.
  let(:store_cookie_domain) {session_domain == :all ? '.code.org' : nil}

  # App under the middleware. Echoes the session id the downstream stack would
  # read, and -- like the real session store -- writes the cookie back under the
  # configured scope when a session is present.
  let(:app) do
    lambda do |env|
      read = Rack::Request.new(env).cookies[COOKIE]
      headers = {}
      if read
        cookie = "#{COOKIE}=#{read}; path=/; HttpOnly"
        cookie += "; domain=#{store_cookie_domain}" if store_cookie_domain
        headers['Set-Cookie'] = cookie
      end
      [200, headers, [read.to_s]]
    end
  end
  let(:middleware) do
    Rack::SessionCookieScopeMigration.new(app, cookie_name: COOKIE, session_domain: -> {session_domain})
  end

  # Drive one request. Returns [status, headers, body, env] so tests can assert
  # both the rewritten request env and the response headers.
  def call(cookie_header, host: STUDIO_HOST)
    env = Rack::MockRequest.env_for('/', 'HTTP_HOST' => host)
    env['HTTP_COOKIE'] = cookie_header if cookie_header
    status, headers, body = middleware.call(env)
    [status, headers, body, env]
  end

  def set_cookies(headers)
    Array(headers['Set-Cookie']).flat_map {|h| h.split("\n")}
  end

  # The legacy-cookie deletions the middleware appended, identified by their
  # expiry marker (distinct from the host-only cookie the stub app writes).
  def deletions(headers)
    set_cookies(headers).select {|c| c.include?('max-age=0')}
  end

  describe 'a single session cookie' do
    it 'leaves HTTP_COOKIE untouched' do
      _, _, _, env = call("#{COOKIE}=SOLO")
      _(env['HTTP_COOKIE']).must_equal "#{COOKIE}=SOLO"
    end

    it 'emits no legacy deletion' do
      _, headers, = call("#{COOKIE}=SOLO")
      _(deletions(headers)).must_be_empty
    end

    it 'reads that cookie' do
      _, _, body, = call("#{COOKIE}=SOLO")
      _(body.first).must_equal 'SOLO'
    end
  end

  describe 'duplicate session cookies (stale domain-wide first, host-only last)' do
    let(:header) {"#{COOKIE}=STALE; #{COOKIE}=FRESH"}

    it 'keeps only the last (host-only) occurrence for downstream readers' do
      _, _, _, env = call(header)
      _(env['HTTP_COOKIE']).must_equal "#{COOKIE}=FRESH"
      _(Rack::Request.new(env).cookies[COOKIE]).must_equal 'FRESH'
    end

    it 'resolves the request to the fresh session, not the stale one' do
      _, _, body, = call(header)
      _(body.first).must_equal 'FRESH'
    end

    it 'emits a deletion for the legacy domain-wide cookie' do
      _, headers, = call(header)
      deletion = set_cookies(headers).find {|c| c.include?('domain=.code.org')}
      _(deletion).wont_be_nil
      _(deletion).must_match(/\A#{COOKIE}=;/o)
      _(deletion).must_include 'path=/'
      _(deletion).must_include 'max-age=0'
    end

    it 'preserves the host-only cookie the session store wrote' do
      _, headers, = call(header)
      fresh = set_cookies(headers).find {|c| c.start_with?("#{COOKIE}=FRESH")}
      _(fresh).wont_be_nil
      _(fresh).wont_include 'domain='
    end
  end

  # The current situation: after a brief `domain: nil` deploy the config was
  # rolled back to `domain: :all`. For users who first appeared during that
  # window the roles invert -- the host-only cookie is the stale one, the
  # wildcard cookie the config now writes is fresh -- so the stale cookie to
  # expire is the host-only one, NOT the wildcard.
  describe 'rollback: config writes the wildcard (domain: :all)' do
    let(:session_domain) {:all}
    let(:header) {"#{COOKIE}=STALE; #{COOKIE}=FRESH"}

    it 'still keeps the last (newest) cookie on read' do
      _, _, body, = call(header)
      _(body.first).must_equal 'FRESH'
    end

    it 'expires the stale HOST-ONLY cookie (no Domain), not the wildcard' do
      _, headers, = call(header)
      deletion = deletions(headers).first
      _(deletion).wont_be_nil
      _(deletion).must_match(/\A#{COOKIE}=;/o)
      _(deletion).wont_include 'domain=' # host-only expiry -- must never name .code.org
    end

    it 'does not clobber the wildcard cookie the session store just wrote' do
      _, headers, = call(header)
      store_write = set_cookies(headers).find {|c| c.start_with?("#{COOKIE}=FRESH")}
      _(store_write).wont_be_nil
      _(store_write).must_include 'domain=.code.org'
    end
  end

  describe 'legacy domain derivation' do
    it 'targets .cdn-code.org for adhoc-style hosts' do
      _, headers, = call("#{COOKIE}=A; #{COOKIE}=B", host: 'adhoc-foo-studio.cdn-code.org')
      deletion = set_cookies(headers).find {|c| c.start_with?("#{COOKIE}=;")}
      _(deletion).must_include 'domain=.cdn-code.org'
    end

    it 'keeps three labels for multi-part TLDs (mirrors Rails :all)' do
      _, headers, = call("#{COOKIE}=A; #{COOKIE}=B", host: 'foo.example.co.uk')
      deletion = set_cookies(headers).find {|c| c.start_with?("#{COOKIE}=;")}
      _(deletion).must_include 'domain=.example.co.uk'
    end

    it 'skips deletion for malformed hosts with an empty label' do
      _, headers, = call("#{COOKIE}=A; #{COOKIE}=B", host: 'studio.code.org.')
      _(deletions(headers)).must_be_empty
    end

    it 'skips deletion when the host never carried a domain-wide cookie' do
      _, headers, _body, env = call("#{COOKIE}=A; #{COOKIE}=B", host: 'localhost')
      # The read-side dedup still runs...
      _(env['HTTP_COOKIE']).must_equal "#{COOKIE}=B"
      # ...but with no registrable parent domain, no deletion is emitted.
      _(deletions(headers)).must_be_empty
    end

    it 'skips deletion for bare IPv4 hosts' do
      _, headers, = call("#{COOKIE}=A; #{COOKIE}=B", host: '127.0.0.1')
      _(deletions(headers)).must_be_empty
    end

    it 'skips deletion for IPv6 literal hosts' do
      _, headers, = call("#{COOKIE}=A; #{COOKIE}=B", host: '[::1]')
      _(deletions(headers)).must_be_empty
    end
  end

  describe 'unrelated cookies' do
    it 'preserves other cookies and their order, collapsing the session cookie to its last value' do
      _, _, _, env = call("a=1; #{COOKIE}=STALE; b=2; #{COOKIE}=FRESH; c=3")
      _(env['HTTP_COOKIE']).must_equal "a=1; b=2; c=3; #{COOKIE}=FRESH"
    end

    it 'ignores duplicate non-session cookies' do
      _, headers, _body, env = call("dupe=1; dupe=2")
      _(env['HTTP_COOKIE']).must_equal 'dupe=1; dupe=2'
      _(deletions(headers)).must_be_empty
    end
  end

  describe 'no cookies' do
    it 'passes through cleanly' do
      status, headers, _body, env = call(nil)
      _(status).must_equal 200
      _(env['HTTP_COOKIE']).must_be_nil
      _(deletions(headers)).must_be_empty
    end
  end
end
