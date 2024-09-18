# frozen_string_literal: true

module Rack
  class GlobalEdition
    REGION_KEY = 'ge_region'
    TARGET_HOSTNAMES = Set[
      CDO.dashboard_hostname,
    ].freeze
    AVAILABLE_REGIONS = Set[
      FARSI_REGION = 'fa',
    ].freeze
    ROOT_PATH = '/global'
    PATH_PATTERN = Regexp.new <<~REGEXP.remove(/\s+/)
      ^(?<ge_path>
        #{ROOT_PATH}/
        (?<ge_region>#{AVAILABLE_REGIONS.join('|')})
      )
      (?<main_path>/.*|$)
    REGEXP

    def initialize(app)
      @app = app
    end

    def call(env)
      request = Request.new(env)

      if TARGET_HOSTNAMES.include?(request.hostname)
        if PATH_PATTERN.match?(request.path_info)
          path_vars = PATH_PATTERN.match(request.path_info)

          # Strips the Global Edition subpath (e.g., `/global/fa`) from the request path.
          # request.path == request.script_name + request.path_info
          # - `request.script_name` strips the prefix from the request path
          #   so the application processes requests as if it were running at the root level.
          # - `request.path_info` provides the specific path that should be handled by the application.
          request.script_name += path_vars[:ge_path]
          request.path_info = path_vars[:main_path]

          request.update_param(REGION_KEY, path_vars[:ge_region])
        elsif AVAILABLE_REGIONS.include?(request.cookies[REGION_KEY]) && request.get? && !request.xhr?
          # Redirects to the regional page if the `ge_region` from cookies is available
          # and the request is a non-AJAX GET request (reflected in the browser address bar).
          response = Response.new
          response.redirect(regional_path_for(request), 302)
          return response.finish
        end
      end

      @app.call(env)
    end

    private def regional_path_for(request)
      ge_region = request.cookies[REGION_KEY]

      regional_page_uri = URI(::File.join(request.script_name, ROOT_PATH, ge_region, request.path_info))
      regional_page_uri.query = URI.encode_www_form(request.params) unless request.params.empty?

      regional_page_uri.to_s
    end
  end
end
