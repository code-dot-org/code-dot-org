require 'time'
require 'rack/utils'

module Rack
  # Hotfix for users stranded with two `_learn_session` cookies after the brief
  # `domain: nil` (host-only) deploy that was rolled back to `domain: :all`.
  #
  # Such a browser sends both cookies under one name, oldest first:
  #
  #     Cookie: _learn_session=<stale host-only>; _learn_session=<fresh wildcard>
  #
  # Browsers order equal-path cookies oldest-first (RFC 6265 5.4) and Rack keeps
  # the FIRST occurrence (`Rack::Utils.parse_cookies_header`), so the server
  # reads the STALE host-only cookie -> failed sign-ins and
  # `ActionController::InvalidAuthenticityToken` (HTTP 422).
  #
  # The current config writes the WILDCARD cookie, so the newest (last) cookie
  # is the real one. Per request this middleware:
  #
  #   1. keeps the LAST `_learn_session` cookie on read (rewrites HTTP_COOKIE),
  #      so the Rails session middleware and the /v3 project reader resolve the
  #      real session; and
  #   2. expires the stale host-only cookie with a no-Domain `Set-Cookie`.
  #
  # Both are no-ops unless the request actually carries duplicate session
  # cookies, so ordinary single-cookie traffic is untouched. Self-limiting: once
  # the stale cookie is gone there are no more duplicates.
  #
  # Scope is deliberately minimal and assumes the current `domain: :all` config
  # (stale == host-only). The general two-direction migration ships separately.
  class SessionCookieScopeMigration
    def initialize(app, cookie_name:)
      @app = app
      @cookie_name = cookie_name
    end

    def call(env)
      duplicates = dedupe_session_cookie(env)

      status, headers, body = @app.call(env)

      expire_host_only_cookie(headers) if duplicates

      [status, headers, body]
    end

    # Keep only the last (newest) `_learn_session` cookie in HTTP_COOKIE; leave
    # every other cookie -- and their order -- untouched. Returns true when
    # duplicates were collapsed.
    #
    # We parse the raw header rather than `Rack::Utils.parse_cookies_header`
    # because that helper is first-wins and would hand back the stale cookie --
    # the collision we are fixing.
    private def dedupe_session_cookie(env)
      header = env['HTTP_COOKIE']
      return false if header.nil? || header.empty?

      pairs = header.split(';').map(&:strip).reject(&:empty?)
      session, others = pairs.partition {|pair| pair.split('=', 2).first == @cookie_name}
      return false if session.size < 2

      env['HTTP_COOKIE'] = (others << session.last).join('; ')
      true
    end

    # Expire the stale host-only cookie with a no-Domain deletion. APPEND it
    # (do NOT use Rack::Utils.delete_cookie_header!, which rejects any prior
    # same-name+path Set-Cookie) so we never strip the session store's
    # concurrent wildcard write from this same response. The browser applies
    # both because their (name, domain) identities differ: the host-only cookie
    # is deleted, the wildcard cookie kept.
    private def expire_host_only_cookie(headers)
      headers['Set-Cookie'] = Rack::Utils.add_cookie_to_header(
        headers['Set-Cookie'], @cookie_name,
        value: '', path: '/', max_age: '0', expires: Time.at(0)
      )
    end
  end
end
