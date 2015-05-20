# Rack middleware for rewriting insecure references in an HTML document to prevent serving mixed-content pages.
# Server-side approximation of the "Upgrade Insecure Requests" spec
# (https://w3c.github.io/webappsec/specs/upgrade).
#
require 'cdo/rack/process_html'

module Rack
  class UpgradeInsecureRequests < ProcessHtml
    def initialize(app, options = {})
      options.merge!(xpath: "//img[@src[contains(.,'http://')]]")
      super(app, options) do |nodes|
        puts "nodes=#{nodes.map(&:to_xml)}"
        nodes.each do |node|
          node['src'] = node['src'].sub!('http://','https://')
        end
      end
    end
  end
end
