# Base Rack middleware class for processing html through a Nokogiri filter on every request.
require 'rack/utils'
require 'nokogiri'
require 'cdo/pegasus/string'

module Rack
  class ProcessHtml
    ##
    # Create Rack::ProcessHtml middleware.
    #
    # [app] rack app instance
    # [options] hash of middleware options:
    #           'xpath' - XPath 1.0 string returning the set of nodes to process.
    #           'min_length' - minimum content length to trigger processing (defaults to 1024 bytes)
    #           'skip_if' - a lambda which, if evaluates to true, skips processing
    #           'include' - a lambda (Ruby 1.9+) or string denoting paths to be included in processing
    #           'exclude' - a lambda (Ruby 1.9+) or string denoting paths to be excluded in processing
    # [block] Execute a block containing captured nodes with 2 arguments: (captured_nodes, env)
    def initialize(app, options = {}, &block)
      @app = app

      @content_types = options[:content_types] || ['text/html']
      @min_length = options[:min_length] || 1024
      @skip_if = options[:skip_if]
      @include = options[:include]
      @exclude = options[:exclude]
      @xpath = options[:xpath]
      @block = block
    end

    def call(env)
      status, headers, body = @app.call(env)
      headers = Utils::HeaderHash.new(headers)

      unless should_process?(env, status, headers, body)
        return [status, headers, body]
      end

      content = ''
      body.each {|x| content << x}
      body.close if body.respond_to? :close
      doc = ::Nokogiri::HTML(content)
      process_doc(doc, env)
      content = doc.to_html
      # Update content-length after transform
      headers['content-length'] = content.bytesize.to_s
      response = [content]

      [status, headers, response]
    end

    private

    def process_doc(doc, env)
      nodes = ::Nokogiri::XML::NodeSet.new(doc)
      nodes += doc.xpath(@xpath) unless @xpath.nil?
      @block.call(nodes, env) unless nodes.empty?
    end

    def should_process?(env, status, headers, body)
      # Skip processing empty entity body responses and responses with
      # no-transform set.
      if Utils::STATUS_WITH_NO_ENTITY_BODY.include?(status) ||
          headers['Cache-Control'].to_s =~ /\bno-transform\b/
        return false
      end

      # Skip if content-type header doesn't include one of allowed types.
      if @content_types
        content_type = headers['Content-Type'] || 'application/octet-stream'
        return false unless content_type.include_one_of?(@content_types)
      end

      # Skip if response body is too short
      if @min_length && headers['Content-Length'] &&
          @min_length > headers['Content-Length'].to_i
        return false
      end

      # Skip if :include is provided and evaluates to false
      if @include &&
          !(@include === env['PATH_INFO'])
        return false
      end

      # Skip if :exclude is provided and evaluates to true
      if @exclude &&
          @exclude === env['PATH_INFO']
        return false
      end

      # Skip if :skip_if lambda is provided and evaluates to true
      if @skip_if &&
          @skip_if.call(env, status, headers, body)
        return false
      end

      true
    end
  end
end
