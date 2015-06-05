# Rack middleware for enforcing HTTPS when on a compatible connection.
# Compatibility is marked by the presence of an 'https_ok' cookie set on any successful HTTPS page load.
# The cookie test a transitional measure until we switch our site to 100% HTTPS, when we will remove the cookie test and always redirect.
require 'rack/ssl-enforcer'

module Rack
  class HTTPSRedirect < SslEnforcer

    def initialize(app, options = {})
      super(app, options.merge(hsts: true))
    end

    def call(env)
      status, headers, body = super(env)
      if ssl_request? && !https_ok?
        response = Rack::Response.new body, status, headers
        response.set_cookie('https_ok', {:value => '1', :path => '/', :expires => Time.now+24*60*60})
        response.finish
      else
        [status, headers, body]
      end
    end

    private
    def https_ok?
      @request.cookies['https_ok']
    end

    def enforce_ssl?
      https_ok? && super
    end
  end
end
