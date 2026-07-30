module Rack
  # Recover users left with two `_learn_session` cookies after the brief
  # `domain: nil` (host-only) deploy that was rolled back to `domain: :all`.
  #
  # Such a browser sends both cookies under one name, oldest first:
  #
  #     Cookie: _learn_session=<stale>; _learn_session=<fresh>
  #
  # Browsers order equal-path cookies oldest-first (RFC 6265 5.4) and Rack keeps
  # the FIRST occurrence (`Rack::Utils.parse_cookies_header`), so the server
  # reads the STALE cookie -> failed sign-ins and
  # `ActionController::InvalidAuthenticityToken` (HTTP 422).
  #
  # This middleware rewrites HTTP_COOKIE to keep only the LAST `_learn_session`
  # cookie -- the newest, i.e. the one the current config wrote -- so the Rails
  # session middleware and the /v3 project reader resolve the real session. It
  # only ever reads and rewrites the inbound header; it never touches the
  # response. No-op unless a request actually carries duplicate session cookies,
  # so ordinary single-cookie traffic is untouched.
  #
  # We do not delete the stale cookie: once we keep the newest it is simply
  # ignored on every request, and it expires on its own within one session TTL.
  # This middleware can be removed after duplicate cookies have aged out.
  class SessionCookieScopeMigration
    def initialize(app, cookie_name:)
      @app = app
      @cookie_name = cookie_name
    end

    def call(env)
      keep_last_session_cookie(env)
      @app.call(env)
    end

    # Rewrite HTTP_COOKIE to keep only the last occurrence of the session
    # cookie, leaving every other cookie -- and their order -- untouched.
    #
    # We parse the raw header rather than `Rack::Utils.parse_cookies_header`
    # because that helper is first-wins and would hand back the stale cookie --
    # the collision we are fixing.
    private def keep_last_session_cookie(env)
      header = env['HTTP_COOKIE']
      return if header.nil? || header.empty?

      pairs = header.split(';').map(&:strip).reject(&:empty?)
      session, others = pairs.partition {|pair| pair.split('=', 2).first == @cookie_name}
      return if session.size < 2

      env['HTTP_COOKIE'] = (others << session.last).join('; ')
    end
  end
end
