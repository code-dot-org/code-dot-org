require "zlib"
require "stringio"
require "time"  # for Time.httpdate
require 'rack/utils'

module Rack
  class CdoDeflater
    ##
    # Creates Rack::Deflater middleware.
    #
    # [app] rack app instance
    # [options] hash of deflater options, i.e.
    #           'min_length' - minimum content length to trigger deflating (defaults to 1024 bytes)
    #           'skip_if' - a lambda which, if evaluates to true, skips deflating
    #           'include' - a lambda (Ruby 1.9+) or string denoting paths to be included in deflating
    #           'exclude' - a lambda (Ruby 1.9+) or string denoting paths to be excluded in deflating
    def initialize(app, options = {})
      @app = app

      @content_types = options[:content_types] || [
        'application/javascript',
        'application/json',
        'application/x-javascript',
        'application/xml',
        'application/xml+rss',
        'text/css',
        'text/html',
        'text/javascript;',
        'text/plain',
        'text/xml',
      ]
      @min_length = options[:min_length] || 1024
      @skip_if = options[:skip_if]
      @include = options[:include]
      @exclude = options[:exclude]
    end

    def call(env)
      status, headers, body = @app.call(env)
      headers = Utils::HeaderHash.new(headers)

      unless should_deflate?(env, status, headers, body)
        return [status, headers, body]
      end

      request = Request.new(env)

      encoding = Utils.select_best_encoding(%w(gzip deflate identity),
                                            request.accept_encoding)

      # Set the Vary HTTP header.
      vary = headers["Vary"].to_s.split(",").map { |v| v.strip }
      unless vary.include?("*") || vary.include?("Accept-Encoding")
        headers["Vary"] = vary.push("Accept-Encoding").join(",")
      end

      case encoding
      when "gzip"
        headers['Content-Encoding'] = "gzip"
        headers.delete('Content-Length')
        mtime = headers.key?("Last-Modified") ?
          Time.httpdate(headers["Last-Modified"]) : Time.now
        [status, headers, GzipStream.new(body, mtime)]
      when "deflate"
        headers['Content-Encoding'] = "deflate"
        headers.delete('Content-Length')
        [status, headers, DeflateStream.new(body)]
      when "identity"
        [status, headers, body]
      when nil
        body.close if body.respond_to?(:close)
        message = "An acceptable encoding for the requested resource #{request.fullpath} could not be found."
        [406, {"Content-Type" => "text/plain", "Content-Length" => message.length.to_s}, [message]]
      end
    end

    class GzipStream
      def initialize(body, mtime)
        @body = body
        @mtime = mtime
      end

      def each(&block)
        @writer = block
        gzip  =::Zlib::GzipWriter.new(self)
        gzip.mtime = @mtime
        @body.each { |part|
          gzip.write(part)
          gzip.flush
        }
      ensure
        @body.close if @body.respond_to?(:close)
        gzip.close
        @writer = nil
      end

      def write(data)
        @writer.call(data)
      end
    end

    class DeflateStream
      DEFLATE_ARGS = [
        Zlib::DEFAULT_COMPRESSION,
        # drop the zlib header which causes both Safari and IE to choke
        -Zlib::MAX_WBITS,
        Zlib::DEF_MEM_LEVEL,
        Zlib::DEFAULT_STRATEGY
      ]

      def initialize(body)
        @body = body
      end

      def each
        deflater = ::Zlib::Deflate.new(*DEFLATE_ARGS)
        @body.each { |part| yield deflater.deflate(part, Zlib::SYNC_FLUSH) }
        yield deflater.finish
        nil
      ensure
        @body.close if @body.respond_to?(:close)
        deflater.close
      end
    end

    private

    def should_deflate?(env, status, headers, body)
      # Skip compressing empty entity body responses and responses with
      # no-transform set.
      if Utils::STATUS_WITH_NO_ENTITY_BODY.include?(status) ||
          headers['Cache-Control'].to_s =~ /\bno-transform\b/ ||
         (headers['Content-Encoding'] && headers['Content-Encoding'] !~ /\bidentity\b/)
        return false
      end

      # Skip if response body is too short
      if @min_length > headers['Content-Length'].to_i
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

      # Skip if :content_types provided and response isn't [that type].
      if @content_types
        content_type = headers['Content-Type'] || 'application/octet-stream'
        return content_type.include_one_of?(@content_types)
      end

      true
    end
  end
end
