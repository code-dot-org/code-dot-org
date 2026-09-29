require 'cdo/cookie_helpers'

module Rack
  # Recover users left holding two `_learn_session` cookies after the brief
  # `domain: nil` deploy that was rolled back to `domain: :all`. The browser
  # sends both under one name, oldest-first (RFC 6265 5.4):
  #
  #     Cookie: _learn_session=<stale>; _learn_session=<fresh>
  #
  # Rack keeps the FIRST occurrence (`Rack::Utils.parse_cookies_header`), so the
  # server reads the STALE cookie -> failed sign-ins and HTTP 422 (CSRF). This
  # middleware rewrites HTTP_COOKIE to keep only the LAST (newest) occurrence, so
  # the session middleware and other cookie readers resolve the real session.
  class SessionCookieScopeMigration
    def initialize(app, cookie_name: environment_specific_cookie_name('_learn_session'))
      @app = app
      @cookie_name = cookie_name
    end

    def call(env)
      keep_last_session_cookie(env)
      @app.call(env)
    end

    # Rewrite HTTP_COOKIE to keep only the last occurrence of the session cookie,
    # leaving every other cookie -- and their order -- untouched. We parse the
    # raw header ourselves because `Rack::Utils.parse_cookies_header` is
    # first-wins and would hand back the stale cookie we are trying to drop.
    private def keep_last_session_cookie(env)
      header = env['HTTP_COOKIE']
      return if header.nil? || header.empty?

      pairs = header.split(';').map(&:strip).reject(&:empty?)
      session, others = pairs.partition {|pair| session_cookie?(pair)}
      return if session.size < 2

      env['HTTP_COOKIE'] = (others << session.last).join('; ')
    end

    private def session_cookie?(pair)
      pair.split('=', 2).first == @cookie_name
    end
  end
end
