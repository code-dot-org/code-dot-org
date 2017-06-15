# Rack middleware for cache-extending relative references by inserting a content digest in the path.
# Currently rewrites stylesheet hrefs, but can be extended to cache-extend other references.

require 'cdo/rack/process_html'
require 'net/http'

module Rack
  class ContentDigest < ProcessHtml
    attr_reader :request

    def initialize(app)
      super(
        app,
        xpath: '//link[@href[starts-with(.,"/")] and @rel="stylesheet"]'
      ) do |nodes, env|
        @request = Request.new(env)
        nodes.each do |node|
          process(node)
        end
      end
    end

    private

    def process(node)
      href = node['href'].to_s
      url = URI(CDO.site_url(request.site, href, CDO.default_scheme))
      headers = Net::HTTP.start(url.host, url.port, use_ssl: url.scheme == 'https').head(url.path).to_hash
      if (content_tag = headers['etag'] || headers['last-modified'])
        digest = Digest::MD5.hexdigest(content_tag.last)
        ext = ::File.extname(href)
        node['href'] = "#{href.chomp(ext)}-#{digest}#{ext}"
      end
    end
  end
end
