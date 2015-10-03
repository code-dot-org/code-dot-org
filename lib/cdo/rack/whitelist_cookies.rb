# Rack middleware that whitelists cookies based on path-based cache behaviors.
# Behaviors are defined in http cache config.
require '../../../cookbooks/cdo-varnish/libraries/helpers'

module Rack
  class WhitelistCookies
    attr_reader :config

    def initialize(app, options = {})
      @app = app
      @config = options[:config]
    end

    def call(env)
      path     = Rack::Request.new(env).path
      behavior = behavior_for_path((config[:behaviors] + [config[:default]]), path)
      cookies = behavior[:cookies]
      # Pass all cookies
      return @app.call(env) if cookies == 'all'

      # Strip all cookies
      if cookies == 'none'
        env.delete 'HTTP_COOKIE'
        status, headers, body = @app.call(env)
        headers.delete'Set-Cookie'
        return [status, headers, body]
      end

      # Strip all cookies not in whitelist
      env.delete('HTTP_COOKIE') if included

      status, headers, body = @app.call(env)
      headers.delete('Set-Cookie') if included

      [status, headers, body]
    end
  end
end
