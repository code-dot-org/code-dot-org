# Rack middleware for rewriting explicitly-insecure references in an HTML document to prevent serving mixed-content pages via HTTPS.
# Aims to be a server-side polyfill-approximation of the "Upgrade Insecure Requests" spec:
# http://www.w3.org/TR/upgrade-insecure-requests

require 'cdo/rack/process_html'

module Rack
  class UpgradeInsecureRequests < ProcessHtml

    # Hash of domains we want to rewrite links from http-explicit to protocol-relative urls.
    # Most of the time, switching scheme from http to https will work, but we can add any exceptions to this list.
    # Only the first match is rewritten
    HTTPS_DOMAINS = {
        /\Ahttp:\/\/.+\.jotformpro\.com/ => '//secure.jotformpro.com',
        /\Ahttp:\/\// => '//'
    }

    def initialize(app)
      super(
          app,
          skip_if: lambda(&method(:not_ssl?)),
          xpath:%w(img script embed iframe).map{|x|"//#{x}[@src[starts-with(.,'http://')]]"}.join(' | ')
      ) do |nodes|
        nodes.each{|node|process(node)}
      end
    end

    def call(env)
      super(env).tap do |_, headers, _|
        # Add CSP headers to prohibit+log mixed content.
        # See 'recommendations' and 'reporting upgrades':
        # http://www.w3.org/TR/upgrade-insecure-requests/#recommendations
        # http://www.w3.org/TR/upgrade-insecure-requests/#reporting-upgrades
        if ssl?(env)
          # headers['Content-Security-Policy'] = 'upgrade-insecure-requests'
          headers['Content-Security-Policy'] = [
              "default-src 'self' https:",
              "script-src 'self' https: 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' https: 'unsafe-inline'",
              "img-src 'self' https: data:",
              "font-src 'self' https: data:",
              "report-uri #{CDO.code_org_url('https/mixed-content')}"
          ].join('; ')
        end
      end
    end

    private

    def ssl?(env)
      Request.new(env).ssl?
    end

    def not_ssl?(env, *_)
      !ssl?(env)
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
