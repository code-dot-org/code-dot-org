# Rack middleware for rewriting explicitly-insecure references in an HTML document to prevent serving mixed-content pages via HTTPS.
# Aims to be a server-side polyfill-approximation of the "Upgrade Insecure Requests" spec:
# http://www.w3.org/TR/upgrade-insecure-requests

require 'cdo/rack/process_html'

module Rack
  class UpgradeInsecureRequests < ProcessHtml

    # Hash of domains we want to rewrite links from http-explicit to protocol-relative urls.
    # Only the first match is rewritten
    HTTPS_DOMAINS = {
        /\Ahttp:\/\/.+\.jotformpro\.com/ => '//secure.jotformpro.com',
        /\Ahttp:\/\// => '//'
    }

    def initialize(app)
      super(
          app,
          skip_if: lambda(&method(:not_ssl?)),
          xpath:%w(img script).map{|x|"//#{x}[@src[starts-with(.,'http://')]]"}.join(' | ')
      ) do |nodes|
        nodes.each{|node|process(node)}
      end
    end

    def call(env)
      super(env).tap do |_, headers, _|
        # Add upgrade-insecure-requests header for compatible browsers
        headers['Content-Security-Policy'] = 'upgrade-insecure-requests' unless not_ssl?(env)
      end
    end

    private

    def not_ssl?(env, *_)
      !(Request.new(env).ssl?)
    end

    def process(node)
      node['src'] = process_url(node['src']) if node['src']
    end

    def process_url(src)
      HTTPS_DOMAINS.each do |http, https|
        matched = src.sub!(http, https)
        return src if matched
      end
      src
    end
  end
end
