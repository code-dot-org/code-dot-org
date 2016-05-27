# Rack middleware that whitelists cookies and headers based on path-based cache behaviors.
# Behaviors are defined in http cache config.
require_relative '../../../cookbooks/cdo-varnish/libraries/helpers'
require 'active_support/core_ext/hash/slice'
require 'cdo/rack/response'
require 'cdo/aws/cloudfront'

module Rack
  module Whitelist
    # Downstream middleware filters out unwanted HTTP request headers and cookies,
    # and extracts cookies into HTTP headers before the request reaches the cache.
    class Downstream
      attr_reader :config

      def initialize(app, config)
        @app = app
        @config = config
      end

      def call(env)
        return [403, {}, ['Unsupported method.']] unless AWS::CloudFront::ALLOWED_METHODS.include?(env['REQUEST_METHOD'].upcase)
        request = Rack::Request.new(env)
        path = request.path
        behavior = behavior_for_path((config[:behaviors] + [config[:default]]), path)

        # Filter whitelisted request headers.
        headers = behavior[:headers]
        REMOVED_HEADERS.each do |remove_header|
          name, value = remove_header.split ':'
          unless headers.include? name
            http_header = "HTTP_#{name.upcase.tr('-', '_')}"
            if value.nil?
              env.delete http_header
            else
              env[http_header] = value
            end
          end
        end

        cookies = behavior[:cookies]
        case cookies
          when 'all'
            # Pass all cookies.
            @app.call(env)
          when 'none'
            # Strip all cookies
            env.delete 'HTTP_COOKIE'
            status, headers, body = @app.call(env)
            headers.delete 'Set-Cookie'
            [status, headers, body]
          else
            # Strip all request cookies not in whitelist.
            # Extract whitelisted cookies to X-COOKIE-* request headers.
            request_cookies = request.cookies
            request_cookies.slice!(*cookies)
            cookie_str = request_cookies.map do |key, value|
              env_key = "HTTP_X_COOKIE_#{key.upcase.tr('-', '_')}"
              env[env_key] = value
              Rack::Utils.escape(key) + '=' + Rack::Utils.escape(value)
            end.join('; ') + ';'
            env['HTTP_COOKIE'] = cookie_str
            @app.call(env)
        end
      end
    end

    # Upstream middleware adds Vary headers to the HTTP response
    # before the response reaches the cache.
    class Upstream
      attr_reader :config
      def initialize(app, config)
        @app = app
        @config = config
      end

      def call(env)
        request = Rack::Request.new(env)
        path     = request.path
        behavior = behavior_for_path((config[:behaviors] + [config[:default]]), path)

        status, headers, body = @app.call(env)
        response = Rack::Response.new(body, status, headers)

        behavior[:headers].each do |header|
          response.add_header('Vary', header)
        end
        response.add_header('Vary', 'Host')

        cookies = behavior[:cookies]
        case cookies
          when 'all'
            response.add_header 'Vary', 'Cookie'
          when 'none'
            # Do nothing.
          else
            # Add "Vary: X-COOKIE-*" to the response for each whitelisted cookie.
            request_cookies = request.cookies
            request_cookies.slice!(*cookies)
            request_cookies.keys.each do |key|
              response.add_header 'Vary', "X-COOKIE-#{key.gsub('_', '-')}"
            end
        end
        response.finish
      end
    end
  end

end
