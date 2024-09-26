# frozen_string_literal: true

module Rack
  class GlobalEdition
    REGION_KEY = 'ge_region'
    LANGUAGE_COOKIE_KEY = 'language_'
    TARGET_HOSTNAMES = Set[
      CDO.dashboard_hostname,
    ].freeze
    AVAILABLE_REGIONS = Set[
      FARSI_REGION = 'fa',
    ].freeze

    # TODO: Replace with the actual mapping list of regional locales from the Global Edition config files.
    # @example {'fa' => 'fa-IR', 'en' => 'en-US', ...}
    REGIONS_LOCALES = YAML.load_file(CDO.dir('dashboard/config/locales.yml')).slice(*AVAILABLE_REGIONS)

    class RouteHandler
      ROOT_PATH = '/global'
      # @example Matches paths like `/global/fa/home`, capturing:
      # - ge_prefix: "/global/fa"
      # - ge_region: "fa"
      # - main_path: "/home"
      PATH_PATTERN = Regexp.new <<~REGEXP.remove(/\s+/)
        ^(?<ge_prefix>
          #{ROOT_PATH}/
          (?<ge_region>#{AVAILABLE_REGIONS.join('|')})
        )
        (?<main_path>/.*|$)
      REGEXP

      attr_reader :app, :request

      def initialize(app, request)
        @app = app
        @request = request
      end

      # @note Changes to the `request` should be made before the `response` is initialized to apply the changes.
      def call
        if request.params.key?(REGION_KEY)
          setup_region(request.params[REGION_KEY]) if region_changed?(request.params[REGION_KEY])

          redirect_uri = URI(request_path_vars(:main_path).first || request.path)
          redirect_uri.query = URI.encode_www_form(request.params.except(REGION_KEY)).presence

          response.redirect(redirect_uri.to_s)
        elsif PATH_PATTERN.match?(request.path)
          ge_prefix, ge_region, main_path = request_path_vars(:ge_prefix, :ge_region, :main_path)

          # Strips the Global Edition path prefix (e.g., `/global/fa`) from the request path.
          # request.path == request.script_name + request.path_info
          # - `request.script_name` strips the prefix from the request path
          #   so the application processes requests as if it were running at the root level.
          # - `request.path_info` provides the specific path that should be handled by the application.
          request.script_name = ::File.join(ge_prefix, request.script_name).chomp('/')
          request.path_info = main_path

          setup_region(ge_region) if region_changed?(ge_region)
        elsif region_available?(request.cookies[REGION_KEY]) && request_redirectable?
          # Redirects to the regional version of the path.
          response.redirect ::File.join(ROOT_PATH, request.cookies[REGION_KEY], request.fullpath)
        end

        response.finish
      end

      # @note Once the `response` instance is initialized, any changes to the `request` made afterward will not be applied.
      private def response
        @response ||= Rack::Response[*app.call(request.env)]
      end

      private def region_changed?(new_region)
        request.cookies[REGION_KEY] != new_region
      end

      private def request_path_vars(*keys)
        PATH_PATTERN.match(request.path)&.values_at(*keys) || []
      end

      private def set_global_cookie(key, value)
        cookie_data = {
          domain: ".#{PublicSuffix.parse(request.hostname).domain}", # the root domain (e.g., ".code.org")
          path: '/',
          same_site: :lax,
        }

        if value
          response.set_cookie(key, cookie_data.merge(value: value, max_age: 10.years))
        else
          response.delete_cookie(key, cookie_data)
        end

        # Prevents the cookie from being discarded under resource constraints.
        response.set_cookie_header = "#{response.set_cookie_header}; priority=high;"
      end

      private def region_available?(region)
        region.present? && AVAILABLE_REGIONS.include?(region)
      end

      private def setup_region(region)
        # Resets the region if it's `nil` or sets it only if it's available.
        return unless region.nil? || region_available?(region)

        # Sets the request cookies to apply changes immediately without needing to reload the page.
        request.cookies[REGION_KEY] = region
        request.cookies[LANGUAGE_COOKIE_KEY] = REGIONS_LOCALES[region] if REGIONS_LOCALES[region]

        # Updates the global `ge_region` cookie to lock the platform to the regional version.
        set_global_cookie(REGION_KEY, request.cookies[REGION_KEY])
        # Updates the global `language` cookie to enforce the switch to the regional language.
        set_global_cookie(LANGUAGE_COOKIE_KEY, request.cookies[LANGUAGE_COOKIE_KEY])
      end

      private def app_route?(path)
        Rails.application.routes.recognize_path(path).present?
      rescue ActionController::RoutingError
        false
      end

      # Determines if the request is eligible for redirection.
      # To improve efficiency, the redirection should only affect the browser's address bar,
      # avoiding redirection for non-visible to user requests such as AJAX, non-GET, or asset requests.
      private def request_redirectable?
        return false unless request.get? # only GET request can be redirected
        return false if request.xhr? # only non-AJAX requests should be redirected

        # The application's routing path indicates that it is not an asset or public file path.
        app_route?(request.path)
      end
    end

    def initialize(app)
      @app = app
    end

    def call(env)
      request = Request.new(env)

      if TARGET_HOSTNAMES.include?(request.hostname)
        RouteHandler.new(@app, request).call
      else
        @app.call(env)
      end
    end
  end
end
