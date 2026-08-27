require 'time'
require 'rack/request'
require 'rack/utils'

module Rack
  # Transitional middleware for narrowing/rolling the Rails session cookie
  # (`_learn_session`) between a domain-wide scope (`Domain=.code.org`, from
  # `domain: :all`) and host-only (`studio.code.org`, from `domain: nil`).
  #
  # Re-scoping a cookie is not an in-place operation: changing the config sets a
  # new cookie under the new scope but leaves the old cookie in place, so the
  # browser then sends BOTH -- same name, no domain attribute -- in one header:
  #
  #     Cookie: _learn_session=OLD; _learn_session=NEW
  #
  # Browsers order equal-path cookies oldest-first (RFC 6265 5.4) and Rack's
  # parser is first-wins (`Rack::Utils.parse_cookies_header`), so plain reads
  # resolve the OLDER cookie. Once a sign-in rotates the session id (Devise
  # `reset_session`), OLD and NEW diverge and the server reads a stale session
  # -> failed sign-ins and `ActionController::InvalidAuthenticityToken` (CSRF).
  #
  # The single invariant that holds in BOTH directions: the newest cookie is the
  # one the current config just wrote, i.e. the real one; the older,
  # other-scoped cookie is the stale leftover. So:
  #
  #   1. Read side (`dedupe_session_cookie`): keep the LAST occurrence -- the
  #      newest, and therefore the cookie the current config wrote -- so both
  #      readers (the Rails session middleware and
  #      `Cdo::RequestExtension#user_id_from_session_store`, feeding the /v3
  #      endpoints) resolve the correct session. This is direction-agnostic.
  #
  #   2. Write side (`expire_stale_duplicate`): expire the OTHER-scoped, stale
  #      cookie -- the scope the current config does NOT write:
  #        * config writes wildcard (domain: :all) -> stale is host-only
  #        * config writes host-only (domain: nil) -> stale is wildcard
  #      Getting this direction wrong deletes the good cookie, so the scope is
  #      taken from the live session_store config, not guessed.
  #
  # The read-side keep-LAST makes every request correct even before the stale
  # cookie is expired; the write-side expiry is cleanup. Self-limiting: once the
  # stale cookie is gone there are no duplicates and nothing fires. Remove this
  # middleware once superseded cookies have aged out (one
  # CDO.dashboard_session_ttl_days window after the last scope change).
  class SessionCookieScopeMigration
    # Set on the Rack env when the request carried duplicate session cookies,
    # signalling the response phase to expire the stale one.
    DUPLICATES_ENV_KEY = 'cdo.session_cookie.duplicates_removed'.freeze

    # @param cookie_name [String] resolved session cookie key for this
    #   environment, i.e. `CDO.session_cookie_name`.
    # @param session_domain [#call] callable returning the session_store's live
    #   `:domain` option (`:all` or `nil`). A callable, not a value, because the
    #   session_store initializer runs after this middleware is wired, and the
    #   option can change across deploys.
    def initialize(app, cookie_name:, session_domain:)
      @app = app
      @cookie_name = cookie_name
      @session_domain = session_domain
    end

    def call(env)
      dedupe_session_cookie(env)

      status, headers, body = @app.call(env)

      expire_stale_duplicate(env, headers) if env[DUPLICATES_ENV_KEY]

      [status, headers, body]
    end

    # Collapse the session cookie to a single value in HTTP_COOKIE, keeping only
    # its last (newest) occurrence. Flags the env when duplicates were found so
    # the response phase can expire the stale one.
    #
    # We parse the raw header by hand rather than via
    # `Rack::Utils.parse_cookies_header` on purpose: that helper returns a Hash
    # and is FIRST-wins, so it would silently discard the newest cookie and hand
    # us the stale one -- exactly the collision we are here to fix. Working on
    # the raw pairs is the only way to see the duplicates.
    private def dedupe_session_cookie(env)
      header = env['HTTP_COOKIE']
      return if header.nil? || header.empty?

      pairs = header.split(';').map(&:strip).reject(&:empty?)
      session, others = pairs.partition {|pair| session_cookie?(pair)}
      return if session.size < 2

      # Keep the last (newest) session cookie -- the one the current config
      # wrote. Non-session cookies -- including any legitimately duplicated
      # ones -- keep their relative order.
      env['HTTP_COOKIE'] = (others << session.last).join('; ')
      env[DUPLICATES_ENV_KEY] = true
    end

    private def session_cookie?(pair)
      pair.split('=', 2).first == @cookie_name
    end

    # Expire the stale duplicate: the cookie scoped OPPOSITE to what the current
    # config writes. Reading the direction from the live config -- rather than
    # assuming one -- is what keeps a rollback (`:all` after a stint of `nil`)
    # from deleting the good cookie.
    private def expire_stale_duplicate(env, headers)
      if wildcard_domain_config?
        expire_host_only_cookie(headers)
      else
        expire_wildcard_cookie(env, headers)
      end
    end

    private def wildcard_domain_config?
      [:all, 'all'].include?(@session_domain.call)
    end

    # Config writes the wildcard cookie, so the stale duplicate is host-only.
    # APPEND a host-only (no-Domain) expiry rather than using
    # `delete_cookie_header!`: that helper rejects any prior same-name+path
    # Set-Cookie, which would strip the session store's concurrent wildcard
    # write from this very response. A plain append leaves that write intact --
    # the browser applies both because (name, domain) differ.
    private def expire_host_only_cookie(headers)
      headers['Set-Cookie'] = Rack::Utils.add_cookie_to_header(
        headers['Set-Cookie'], @cookie_name,
        value: '', path: '/', max_age: '0', expires: Time.at(0)
      )
    end

    # Config writes the host-only cookie, so the stale duplicate is the
    # wildcard. `delete_cookie_header!` with both :domain and :path narrows its
    # rejection regexp to a prior Set-Cookie bearing that exact domain+path --
    # never the store's host-only write, which carries no domain attribute.
    private def expire_wildcard_cookie(env, headers)
      domain = legacy_cookie_domain(env)
      return unless domain

      Rack::Utils.delete_cookie_header!(headers, @cookie_name, domain: domain, path: '/')
    end

    # The domain `domain: :all` would scope the session cookie to for this host.
    # A verbatim port of the `:all` branch in ActionDispatch::Cookies#handle_options
    # (actionpack 7.0, action_dispatch/middleware/cookies.rb) for the
    # no-`:tld_length` case our session_store uses. Returns nil for hosts that
    # never carried a domain-wide cookie (IPs, malformed, single-label).
    private def legacy_cookie_domain(env)
      host = Rack::Request.new(env).host.to_s # strips port and IPv6 brackets
      labels = host.split('.', -1)
      return nil if host.match?(/\A[\d.]+\z/) || labels.include?('') || labels.length == 1

      # Multi-part TLDs (e.g. `co.uk`, `com.au`) keep three labels; all others
      # keep two -- the registrable domain -- with a leading dot.
      registrable = /\.[^.]{2,3}\.[^.]{2}\z/.match?(host) ? labels.last(3) : labels.last(2)
      ".#{registrable.join('.')}"
    end
  end
end
