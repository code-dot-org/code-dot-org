require 'rack'
require 'net/http'
require_relative '../env'
require_relative './http_document'

module Pegasus

  class Proxy

    EXCLUDE_HEADERS = [
      'Connection',
      'Content-Length',
      'Server',
      'Status',
      'Transfer-Encoding',
      'X-Drupal-Cache',
      'X-Generator',
      'X-Powered-By',
    ]

    def initialize(params={})
      @server = params[:server]
      @host = params[:host]
    end

    def call(env)
      status, headers, content = dup._call(env)
      HttpDocument.new(content[0], headers, status)
    end

    def _call(env)
      request = Rack::Request.new(env)

      host_name = @host || request.host

      uri = remote_uri(request)
      return [400,{'Content-Type'=>'text/plain'},['Bad Request (Invalid URI)']] if uri.nil?

      proxy_http = Net::HTTP.new(uri.host, uri.port)
      if request.post?
        proxy_request = Net::HTTP::Post.new(uri.request_uri)
        proxy_request.body = request.body.read
        proxy_request.add_field('Content-Type', request.content_type)
      else
        proxy_request = Net::HTTP::Get.new(uri.request_uri)
      end

      env.each_pair do |name,value|
        name = name.to_s
        next unless name.start_with? 'HTTP_'
        name = name[5..-1]
        next if ['VERSION','CONNECTION','HOST'].include?(name)
        proxy_request.add_field(name, value)
      end
      proxy_request.add_field('HOST', host_name)
      proxy_request.add_field('X-FORWARDED-FOR', request.ip)

      proxy_response = proxy_http.request(proxy_request)
      status = proxy_response.code

      # NOTE: Drupal, for some reason, doesn't return the port indicated by the
      # the HOST header, instead returning the actual port number we connecte to.
      # We re-write that in the headers AND HTML bodies.
      proxy_host = http_host_and_port(host_name, uri.port)
      host = http_host_and_port(request.host, request.port)
      headers = {}
      proxy_response.header.each_capitalized do |name,value|
        unless EXCLUDE_HEADERS.include?(name)
          headers[name] = value.gsub(proxy_host,host).gsub(host_name,host)
        end
      end
      content = proxy_response.body
      if headers['Content-Type'].to_s.include?('text/html')
        if headers['Content-Type'].to_s.include?('charset=utf-8')
          content = content.to_s.force_encoding('UTF-8')
        end
      end
      unless headers.has_key?('Content-Type')
        headers['Content-Type'] = 'application/octet-stream'
      end
      headers['Content-Length'] = content.bytesize.to_s unless content.nil?

      if headers.key?('Last-Modified')
        # Fix drupal dates to be RFC2616-compliant.
        headers['Last-Modified'] = headers['Last-Modified'].gsub('+0000', 'GMT')
      end

      [status,headers,[content]]
    end

    def remote_uri(request)
      begin
        return URI.parse("http://#{@server}#{request.fullpath}")
      rescue URI::InvalidURIError
        return nil
      end
    end

  end

end
