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
      # Pass all cookies
      return @app.call(env) if cookies == 'all'

      # Strip all cookies
      if cookies == 'none'
        env.delete 'HTTP_COOKIE'
        status, headers, body = @app.call(env)
        headers.delete 'Set-Cookie'
        return [status, headers, body]
      end

      # Strip all request cookies not in whitelist
      request_cookies = request.cookies
      request_cookies.slice!(*cookies)
      cookie_str = request_cookies.map{|k,v|"#{k}=#{v}"}.join('; ')
      env['HTTP_COOKIE'] = cookie_str
      env['rack.request.cookie_string'] = cookie_str
      status, headers, body = @app.call(env)

      [status, headers, body]
    end
  end
end
