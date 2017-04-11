require 'cdo/optimizer'

# Rack middleware that applies an optimizing filter pass on response content.
module Rack
  class Optimize
    def initialize(app, options = {})
      @app = app
      @content_types = options.delete(:content_types) || Cdo::Optimizer::MIME_TYPES
    end

    def call(env)
      status, headers, body = @app.call(env)
      headers = Utils::HeaderHash.new(headers)
      unless should_process?(env, status, headers, body)
        return [status, headers, body]
      end

      content = ''
      body.each {|x| content += x}
      body.close if body.respond_to? :close

      content_type = headers['Content-Type'] || 'application/octet-stream'
      optimized_content = Cdo::Optimizer.optimize(content, content_type)

      # If the optimizer returns nil, the optimization is still pending.
      # Return `no-store` cache header so the un-optimized content won't get cached.
      if optimized_content.nil?
        headers['Cache-Control'] = 'private, no-store'
        optimized_content = content
      end

      # Update content-length after transform.
      headers['content-length'] = optimized_content.bytesize.to_s
      response = [optimized_content]

      [status, headers, response]
    end

    def should_process?(env, status, headers, body)
      # Skip empty entity body responses and responses with no-transform set.
      if Utils::STATUS_WITH_NO_ENTITY_BODY.include?(status) ||
        headers['Cache-Control'].to_s =~ /\bno-transform\b/
        return false
      end

      # Skip if content-type header doesn't include one of allowed types.
      if @content_types
        content_type = headers['Content-Type'] || 'application/octet-stream'
        return false unless content_type.include_one_of?(@content_types)
      end

      true
    end
  end
end
