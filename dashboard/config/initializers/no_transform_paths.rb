require 'action_dispatch/middleware/static'
require 'rack/cache'

# Appends Cache-Control: no-transform to Rails static assets in matching paths.
# Use this filter to bypass image-optimization transformations on specific assets.
module Cdo
  module NoTransformPaths
    NO_TRANSFORM_PATHS = %w(
      /craft/
    ).freeze

    def serve(request, filepath, content_headers)
      status, headers, body = super(request, filepath, content_headers)
      new_headers = filter_headers(request.path_info, headers)
      return [status, new_headers, body]
    end

    def filter_headers(path, headers)
      if NO_TRANSFORM_PATHS.any? {|no_transform_path| path.include?(no_transform_path)}
        headers ||= {}
        cache_control = Rack::Cache::CacheControl.new(headers[Rack::CACHE_CONTROL])
        cache_control['no-transform'] = true
        headers[Rack::CACHE_CONTROL] = cache_control.to_s
      end

      headers
    end
  end
end

Rails.application.config.to_prepare do
  ActionDispatch::FileHandler.prepend Cdo::NoTransformPaths
end
