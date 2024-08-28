# Rack middleware for rewriting explicitly-insecure references in an HTML document to prevent serving mixed-content pages via HTTPS.
# Aims to be a server-side polyfill-approximation of the "Upgrade Insecure Requests" spec:
# http://www.w3.org/TR/upgrade-insecure-requests

require 'cdo/rack/process_html'
require 'dynamic_config/dcdo'
require 'set'

module Rack
  class UpgradeInsecureRequests < ProcessHtml
    # Hash of domains we want to rewrite links from http-explicit to protocol-relative urls.
    # Most of the time, switching scheme from http to https will work, but we can add any exceptions to this list.
    # Only the first match is rewritten
    HTTPS_DOMAINS = {
      /\Ahttp:\/\/.+\.jotformpro\.com/ => '//secure.jotformpro.com',
      /\Ahttp:\/\// => '//'
    }.freeze

    def initialize(app)
      super(
        app,
          xpath: %w(img script embed iframe).map {|x| "//#{x}[@src[starts-with(.,'http://')]]"}.join(' | ')
      ) do |nodes, env|
        nodes.each do |node|
          # Output the urls we're rewriting so we can update them to https
          # in our codebase.
          if ssl?(env)
            puts "REWRITING: #{node}"
            process(node)
          end
        end
      end
    end

    def call(env)
      super(env).tap do |_, headers, _|
        # Add CSP headers to prohibit+log mixed content.
        # See 'recommendations' and 'reporting upgrades':
        # http://www.w3.org/TR/upgrade-insecure-requests/#recommendations
        # http://www.w3.org/TR/upgrade-insecure-requests/#reporting-upgrades

        policies = []
        if ssl?(env)
          # headers['Content-Security-Policy'] = 'upgrade-insecure-requests'
          policies += [
            "default-src 'self' https:",
            "frame-src 'self' https: blob:",
            "worker-src 'self' blob: ",
            "child-src 'self' blob: ",
            "script-src 'self' https: 'unsafe-inline' https://vaas.acapela-group.com 'unsafe-eval'",
            "style-src 'self' https: 'unsafe-inline'",
            "img-src 'self' https: data: blob: https://*.code.org",
            "font-src 'self' https: data:",
            "connect-src 'self' https: https://api.pusherapp.com wss://ws.pusherapp.com http://localhost:8080 https://curriculum.code.org/ wss://*.code.org",
            "media-src 'self' https: data: https://*.code.org http://vaas.acapela-group.com",
            "report-uri #{CDO.code_org_url('https/mixed-content')}"
          ]
        end

        # If the DCDO or CDO allowed_iframe_ancestors configuration variable is
        # defined, override the default SAMEORIGIN policy to allow the
        # specified source list (as described in
        # http://w3c.github.io/webappsec-csp/#source-lists) to frame our
        # content.

        # If the request path is an allow listed, the frame-ancestors policy is made permissive.
        # Warning: Our default policy is to deny iframes for security concerns.  Allow list entries are only to be
        # added when absolutely necessary, when the scope is reduced to bare minimum to meet the objectives, and once
        # security has reviewed and signed off on the specific changed.  Please contact security for more information.
        iframe_path_allowlist = Set.new(["/lti/v1/authenticate", "/lti/v1/dynamic_registration"])
        cdo_allowed_iframe_ancestors = DCDO.get('allowed_iframe_ancestors', nil) || CDO.allowed_iframe_ancestors
        allowed_iframe_ancestors = iframe_path_allowlist.include?(env['REQUEST_PATH']) ? '*' : cdo_allowed_iframe_ancestors

        if allowed_iframe_ancestors
          (policies << "frame-ancestors 'self' #{allowed_iframe_ancestors}")

          # Clear the older X-Frame-Options header because it doesn't support
          # multiple domains. We need to clear this because on Chrome,
          # contrary to the spec, on Chrome the X-Frame-Options header takes
          # priority over Content-Security-Policy.)
          headers['X-Frame-Options'] = ''
        end

        unless policies.empty? || headers.key?('Content-Security-Policy')
          headers['Content-Security-Policy'] = policies.join('; ')
        end
      end
    end

    private def ssl?(env)
      Request.new(env).ssl?
    end

    private def not_ssl?(env, *_)
      !ssl?(env)
    end

    private def process(node)
      node['src'] = process_url(node['src']) if node['src']
    end

    private def process_url(src)
      HTTPS_DOMAINS.each do |http, https|
        matched = src.sub!(http, https)
        return src if matched
      end
      src
    end
  end
end
