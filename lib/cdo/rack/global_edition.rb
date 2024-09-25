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

    # TODO: Replace with the actual mapping list of regional locales from the Global Edition config file.
    # @example {'fa' => 'fa-IR', 'en' => 'en-US', ...}
    REGIONS_LOCALES = YAML.load_file(Rails.root.join('config/locales.yml')).slice(*AVAILABLE_REGIONS)

    class RoutingHandler
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

      def call
        if PATH_PATTERN.match?(request.path)
          ge_prefix, ge_region, main_path = PATH_PATTERN.match(request.path).values_at(:ge_prefix, :ge_region, :main_path)

          # Strips the Global Edition path prefix (e.g., `/global/fa`) from the request path.
          # request.path == request.script_name + request.path_info
          # - `request.script_name` strips the prefix from the request path
          #   so the application processes requests as if it were running at the root level.
          # - `request.path_info` provides the specific path that should be handled by the application.
          request.script_name = ::File.join(ge_prefix, request.script_name).chomp('/')
          request.path_info = main_path

          # Sets the request cookies to apply changes immediately without needing to reload the page.
          request.cookies[REGION_KEY] = ge_region
          request.cookies[LANGUAGE_COOKIE_KEY] = REGIONS_LOCALES[ge_region] if REGIONS_LOCALES[ge_region]

          # Once the `response` instance is initialized, any changes to the `request` made afterward will not be applied.

          # Updates the global `ge_region` cookie to lock the platform to the regional version.
          response.set_cookie(REGION_KEY, {value: request.cookies[REGION_KEY], path: '/', same_site: :lax})
          # Prevents the cookie from being discarded under resource constraints.
          response.set_cookie_header = "#{response.set_cookie_header}; priority=high;"

          # Updates the global `language` cookie to enforce the switch to the regional language.
          response.set_cookie(
            LANGUAGE_COOKIE_KEY,
            {
              value: request.cookies[LANGUAGE_COOKIE_KEY],
              domain: ".#{PublicSuffix.parse(request.hostname).domain}", # Sets cookies to the root domain (e.g., ".code.org")
              path: '/',
              same_site: :lax,
            }
          )
        elsif redirectable?
          # Redirects to the regional version of the path.
          response.redirect ::File.join(ROOT_PATH, request.cookies[REGION_KEY], request.fullpath)
        end

        response.finish
      end

      private def response
        @response ||= Rack::Response[*app.call(request.env)]
      end

      private def region_available?
        region = request.cookies[REGION_KEY]
        region.present? && AVAILABLE_REGIONS.include?(region)
      end

      private def app_route?
        Rails.application.routes.recognize_path(request.path).present?
      rescue ActionController::RoutingError
        false
      end

      # Determines if the request is eligible for redirection to the regional version of the path.
      # To improve efficiency, the redirection should only affect the browser's address bar,
      # avoiding redirection for non-visible to user requests such as AJAX, non-GET, or asset requests.
      private def redirectable?
        return false unless region_available?
        # Only GET request can be redirected and only non-AJAX requests should be redirected.
        return false unless request.get? && !request.xhr?

        # The application's routing path indicates that it is not an asset or public file path.
        app_route?
      end
    end

    def initialize(app)
      @app = app
    end

    def call(env)
      request = Request.new(env)

      if TARGET_HOSTNAMES.include?(request.hostname)
        RoutingHandler.new(@app, request).call
      else
        @app.call(env)
      end
    end
  end
end
