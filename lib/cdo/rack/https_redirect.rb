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
      request = Rack::Request.new(env)
      if !request.ssl? &&
        request.path_info !~ /\.(png|gif|jpeg|jpg|ico|swf|css|js)(\?[a-z0-9]+)?$/i &&
        request.cookies['https-blocked'].nil? &&
        request.cookies['https_ok'].nil? &&
        request.env['HTTP_X-HTTPS-OK'].nil?

        html = ::File.read(shared_dir('middleware/https_test.html'))
        return Rack::Response.new(html, 200, {'Content-Type' => 'text/html'}).finish
      end

      status, headers, body = super(env)
      if ssl_request? && !https_ok?
        Utils.set_cookie_header! headers, 'https_ok', {:value => '1', :path => '/', :expires => Time.now+24*60*60}
      end
      [status, headers, body]
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
