require 'rack/request'
require 'rack/utils'

module Rack
  # Transitional middleware to safely narrow the Rails session cookie
  # (`_learn_session`) from a domain-wide scope down to host-only.
  #
  # Background: the session_store originally sets `domain: :all`, which scopes the
  # cookie to the registrable domain (`Domain=.code.org`). We want to set the cookie
  # host-only (`studio.code.org`).
  #
  # Re-scoping a cookie is not an in-place operation. Dropping `domain: :all`
  # sets a new host-only cookie but leaves the old domain-wide cookie in place,
  # so the browser then sends BOTH — same name, no domain attribute — in one
  # request header:
  #
  #     Cookie: _learn_session=OLD; _learn_session=NEW
  #
  # Two facts make that fatal without intervention:
  #
  #   * Browsers order equal-path cookies oldest-first (RFC 6265 5.4), so the
  #     stale domain-wide cookie leads.
  #   * Rack's cookie parser keeps the FIRST occurrence of a name and discards
  #     the rest (`Rack::Utils.parse_cookies_header`).
  #
  # So the server reads the stale domain-wide cookie. Because sign-in rotates
  # the session id (Devise `reset_session`), OLD and NEW diverge and every
  # reader resolves the stale session -> failed sign-ins and
  # `ActionController::InvalidAuthenticityToken` (CSRF) errors. This is the
  # regression that reverted #71051.
  #
  # This middleware does two things per request:
  #
  #   1. Read side (`dedupe_session_cookie`): when more than one session cookie
  #      is present, rewrite HTTP_COOKIE to keep only the LAST occurrence. The
  #      session store always writes the cookie host-only now, so the host-only
  #      cookie is the most-recently-created and therefore the last one the
  #      browser sends. Both readers of this cookie -- the Rails session
  #      middleware and `Cdo::RequestExtension#user_id_from_session_store`, the
  #      latter feeding the /v3 project endpoints via `current_user_id` -- read
  #      through the rewritten header and resolve the correct session.
  #
  #   2. Write side (`delete_legacy_cookie`): duplicates prove a domain-wide
  #      cookie still exists, so emit a deletion `Set-Cookie` for the legacy
  #      domain. The stale cookie is removed and stops leaking. Self-limiting:
  #      once it is gone there are no more duplicates and no more deletions.
  #
  # This is belt-and-suspenders. The read-side rewrite keeps every request
  # correct even before the stale cookie is deleted; the write-side deletion
  # performs the actual security cleanup. Remove this middleware once
  # domain-wide cookies have aged out (one CDO.dashboard_session_ttl_days
  # window after deploy).
  class SessionCookieScopeMigration
    # Set on the Rack env when the request carried duplicate session cookies,
    # signalling the response phase to emit the legacy-cookie deletion.
    DUPLICATES_ENV_KEY = 'cdo.session_cookie.duplicates_removed'.freeze

    # @param cookie_name [String] the resolved session cookie key for this
    #   environment, i.e. `CDO.session_cookie_name`.
    def initialize(app, cookie_name:)
      @app = app
      @cookie_name = cookie_name
    end

    def call(env)
      dedupe_session_cookie(env)

      status, headers, body = @app.call(env)

      if env[DUPLICATES_ENV_KEY] && (domain = legacy_cookie_domain(env))
        delete_legacy_cookie(headers, domain)
      end

      [status, headers, body]
    end

    # Collapse the session cookie to a single value in HTTP_COOKIE, keeping only
    # its last occurrence. Flags the env when duplicates were found so the
    # response phase can clean up the stale domain-wide cookie.
    #
    # We parse the raw header by hand rather than via
    # `Rack::Utils.parse_cookies_header` on purpose: that helper returns a Hash
    # and is FIRST-wins, so it would silently discard the host-only cookie and
    # hand us the stale domain-wide one -- exactly the collision we are here to
    # fix. Working on the raw pairs is the only way to see the duplicates.
    private def dedupe_session_cookie(env)
      header = env['HTTP_COOKIE']
      return if header.nil? || header.empty?

      pairs = header.split(';').map(&:strip).reject(&:empty?)
      session, others = pairs.partition {|pair| session_cookie?(pair)}
      return if session.size < 2

      # The session store always writes the cookie host-only now, so the last
      # occurrence is the newest and the one to keep. Non-session cookies --
      # including any legitimately duplicated ones -- keep their relative order.
      env['HTTP_COOKIE'] = (others << session.last).join('; ')
      env[DUPLICATES_ENV_KEY] = true
    end

    private def session_cookie?(pair)
      pair.split('=', 2).first == @cookie_name
    end

    # The domain the `domain: :all` option scoped the session cookie to
    # for this host. A verbatim copy of the logic in (actionpack 7.0,
    # action_dispatch/middleware/cookies.rb) for the no-`:tld_length` case our
    # session_store uses.
    private def legacy_cookie_domain(env)
      host = Rack::Request.new(env).host.to_s # strips port and IPv6 brackets
      labels = host.split('.', -1)
      return nil if host.match?(/\A[\d.]+\z/) || labels.include?('') || labels.length == 1

      # Multi-part TLDs (e.g. `co.uk`, `com.au`) keep three labels; all others
      # keep two -- the registrable domain -- with a leading dot.
      registrable = /\.[^.]{2,3}\.[^.]{2}\z/.match?(host) ? labels.last(3) : labels.last(2)
      ".#{registrable.join('.')}"
    end

    # Append a deletion `Set-Cookie` for the legacy domain-wide cookie. Passing
    # both :domain and :path narrows Rack's rejection regexp so it removes only
    # a prior Set-Cookie bearing that exact domain and path -- never the
    # host-only cookie the session store just wrote (which carries no domain
    # attribute). See Rack::Utils.make_delete_cookie_header.
    private def delete_legacy_cookie(headers, domain)
      Rack::Utils.delete_cookie_header!(headers, @cookie_name, domain: domain, path: '/')
    end
  end
end
