# Base class for processing html
require 'rack/utils'
require 'nokogiri'

module Rack
  class ProcessHtml
    ##
    # Create Rack::ProcessHtml middleware.
    #
    # [app] rack app instance
    # [options] hash of middleware options, i.e.
    #           'min_length' - minimum content length to trigger processing (defaults to 1024 bytes)
    #           'skip_if' - a lambda which, if evaluates to true, skips processing
    #           'include' - a lambda (Ruby 1.9+) or string denoting paths to be included in processing
    #           'exclude' - a lambda (Ruby 1.9+) or string denoting paths to be excluded in processing
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

      puts "Processing!!"
      request = Request.new(env)


      content = body.reduce(:+).tap{|x|x.close if x.respond_to? :close}
      doc = ::Nokogiri::HTML(content)
      process_doc(doc)

      content = doc.to_html
      headers['content-length'] = content.bytesize.to_s
      response = [content]

      [status, headers, response]
    end

    private

    def process_doc(doc)
      puts "Processing doc:#{doc}"
      nodes = ::Nokogiri::XML::NodeSet.new(doc)
      nodes += doc.xpath(@xpath) unless @xpath.nil?
      @block.call(nodes) unless nodes.empty?
    end

    def should_process?(env, status, headers, body)
      # Skip processing empty entity body responses and responses with
      # no-transform set.
      if Utils::STATUS_WITH_NO_ENTITY_BODY.include?(status) ||
          headers['Cache-Control'].to_s =~ /\bno-transform\b/
        return false
      end

      # Skip if :content_types provided and response isn't [that type].
      if @content_types
        content_type = headers['Content-Type'] || 'application/octet-stream'
        return content_type.include_one_of?(@content_types)
      end

      # Skip if response body is too short
      if @min_length > headers['Content-Length'].to_i
        puts "not min length: content-length=#{headers['Content-Length']}"
        return false
      end

      # Skip if :include is provided and evaluates to false
      if @include &&
          !(@include === env['PATH_INFO'])
        puts "include provided"
        return false
      end

      # Skip if :exclude is provided and evaluates to true
      if @exclude &&
          @exclude === env['PATH_INFO']
        puts "exclude provided"
        return false
      end

      # Skip if :skip_if lambda is provided and evaluates to true
      if @skip_if &&
          @skip_if.call(env, status, headers, body)
        puts "skip if provided"
        return false
      end

      true
    end
  end
end
