# Rack middleware that whitelists cookies based on path-based cache behaviors.
# Behaviors are defined in http cache config.
require_relative '../../../cookbooks/cdo-varnish/libraries/helpers'
require 'active_support/core_ext/hash/slice'

module Rack
  class WhitelistCookies
    attr_reader :config

    def initialize(app, config)
      @app = app
      @config = config
    end

    def call(env)
      request = Rack::Request.new(env)
      path     = request.path
      behavior = behavior_for_path((config[:behaviors] + [config[:default]]), path)
      cookies = behavior[:cookies]
      case cookies
        when 'all'
          # Pass all cookies
          @app.call(env)
        when 'none'
          # Strip all cookies
          env.delete 'HTTP_COOKIE'
          status, headers, body = @app.call(env)
          headers.delete 'Set-Cookie'
          [status, headers, body]
        else
          # Strip all request cookies not in whitelist
          request_cookies = request.cookies
          request_cookies.slice!(*cookies)
          cookie_str = request_cookies.map do |key, value|
            Rack::Utils.escape(key) + '=' + Rack::Utils.escape(value)
          end.join('; ')
          env['HTTP_COOKIE'] = cookie_str
          @app.call(env)
      end
    end
  end
end
