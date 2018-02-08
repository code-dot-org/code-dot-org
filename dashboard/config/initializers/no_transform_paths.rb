require 'action_dispatch/middleware/static'
require 'rack/cache'

# Appends Cache-Control: no-transform to Rails static assets in matching paths.
# Use this filter to bypass image-optimization transformations on specific assets.
module Cdo
  module NoTransformPaths
    NO_TRANSFORM_PATHS = %w(
      /craft/
    )

    def serve(request)
      super(request).tap do |_, headers, _|
        filter_headers(request.path_info, headers)
      end
    end

    def filter_headers(path, headers)
      if NO_TRANSFORM_PATHS.any?(&path.method(:include?))
        cache_control = Rack::Cache::CacheControl.new(headers[Rack::CACHE_CONTROL])
        cache_control['no-transform'] = true
        headers[Rack::CACHE_CONTROL] = cache_control.to_s
      end
    end
  end
end
ActionDispatch::FileHandler.prepend Cdo::NoTransformPaths
