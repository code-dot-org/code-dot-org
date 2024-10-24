# frozen_string_literal: true

require 'request_store'
require 'cdo/global_edition'

module Rack
  class GlobalEdition
    REGION_KEY = Cdo::GlobalEdition::REGION_KEY
    LANGUAGE_COOKIE_KEY = 'language_'

    class RouteHandler
      ROOT_PATH = '/global'
      # @example Matches paths like `/global/fa/home`, capturing:
      # - ge_prefix: "/global/fa"
      # - ge_region: "fa"
      # - main_path: "/home"
      PATH_PATTERN = Regexp.new <<~REGEXP.remove(/\s+/)
        ^(?<ge_prefix>
          #{ROOT_PATH}/
          (?<ge_region>#{Cdo::GlobalEdition::REGIONS.join('|')})
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
          new_region = request.params[REGION_KEY]

          main_path = request_path_vars(:main_path).first || request.path
          redirect_uri = URI(
            Cdo::GlobalEdition.region_available?(new_region) ? regional_path_for(new_region, main_path) : main_path
          )
          redirect_uri.query = URI.encode_www_form(request.params.except(REGION_KEY)).presence

          setup_region(new_region) if region_changed?(new_region)

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
        elsif Cdo::GlobalEdition.region_available?(region) && request_redirectable?
          # Redirects to the regional version of the path.
          response.redirect regional_path_for(region, request.fullpath)
        end

        response.finish
      end

      private def region
        request.cookies[REGION_KEY]
      end

      # @note Once the `response` instance is initialized, any changes to the `request` made afterward will not be applied.
      private def response
        @response ||= begin
          RequestStore.store[Cdo::GlobalEdition::REGION_KEY] = region if Cdo::GlobalEdition.region_available?(region)
          Rack::Response[*app.call(request.env)]
        end
      end

      private def region_changed?(new_region)
        region != new_region
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
        response.set_cookie_header = "#{response.set_cookie_header}; priority=high"
      end

      private def setup_region(region)
        # Resets the region if it's `nil` or sets it only if it's available.
        return unless region.nil? || Cdo::GlobalEdition.region_available?(region)

        # Sets the request cookies to apply changes immediately without needing to reload the page.
        request.cookies[REGION_KEY] = region
        request.cookies[LANGUAGE_COOKIE_KEY] = Cdo::GlobalEdition.region_locale(region) if region

        # Updates the global `ge_region` cookie to lock the platform to the regional version.
        set_global_cookie(REGION_KEY, region)
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

      private def regional_path_for(region, main_path)
        ::File.join(ROOT_PATH, region, main_path)
      end
    end

    def initialize(app)
      @app = app
    end

    def call(env)
      request = Request.new(env)

      if Cdo::GlobalEdition.target_host?(request.hostname)
        RouteHandler.new(@app, request).call
      else
        @app.call(env)
      end
    end
  end
end
