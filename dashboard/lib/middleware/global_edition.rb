# frozen_string_literal: true

require 'omniauth'
require 'request_store'

require 'cdo/global_edition'
require 'cdo/honeybadger'
require 'dynamic_config/dcdo'
require 'helpers/cookies'

module Middleware
  class GlobalEdition
    REGION_KEY = Cdo::GlobalEdition::REGION_KEY

    class RouteHandler
      include Middleware::Helpers::Cookies

      # HTTP paths that to be excluded from Global Edition scope.
      EXCLUDED_PATHS = [
        # To make an OAuth callback accessible, it must be added to the whitelist of each SSO provider.
        # Instead of repeating this process for each new Global Edition region,
        # it is more efficient to remove the Global Edition prefix and treat the request as a standard route.
        # Additionally, preventing OAuth routes from being redirected, ensuring the authentication process is not disrupted.
        ::OmniAuth.config.path_prefix, # e.g. `/users/auth`
        # Exclude HoC legacy API routes from Global Edition scope.
        *(defined?(HocLegacy::Engine) ? [HocLegacy::API_ROOT_PATH] : []),
      ].compact.freeze

      attr_reader :app, :env, :request, :current_region, :current_locale

      def initialize(app, env)
        @app = app
        @env = env

        @request = Rack::Request.new(env)
        @current_region = @request.cookies[REGION_KEY].presence
        @current_locale = @request.cookies[LOCALE_KEY].presence
      end

      # @note Changes to the `request` should be made before the `response` is initialized to apply the changes.
      def call
        original_script_name = request.script_name
        original_path_info   = request.path_info

        # Allows setting the GE region via the URL parameter `?ge_region=<region_code>`.
        if request.params.key?(REGION_KEY)
          new_region = request.params[REGION_KEY].presence

          redirect_path = ::File.join('/', request_path_vars(:main_path).first || request.path)
          redirect_path = regional_path_for(new_region, redirect_path) if Cdo::GlobalEdition.region_available?(new_region)

          redirect_uri = URI(redirect_path)
          redirect_uri.query = URI.encode_www_form(request.params.except(REGION_KEY)).presence
          redirect_path = redirect_uri.to_s

          setup_region(new_region)
          setup_redirect_to(redirect_path)
        elsif resolved_region
          url_region, url_prefix, main_path = request_path_vars(:ge_region, :ge_prefix, :main_path)

          if url_region == resolved_region
            unless existing_route?(original_path_info)
              # Strips the Global Edition path prefix (e.g., `/global/fa`) from the request path.
              # request.path == request.script_name + request.path_info
              # - `request.script_name` strips the prefix from the request path
              #   so the application processes requests as if it were running at the root level.
              # - `request.path_info` provides the specific path that should be handled by the application.
              request.script_name = ::File.join(url_prefix, original_script_name).chomp('/') unless excluded_path?(main_path)
              request.path_info   = main_path
            end
          elsif redirectable?
            redirect_path = url_prefix ? main_path : request.path
            redirect_path = "#{redirect_path}?#{request.query_string}" unless request.query_string.empty?
            setup_redirect_to regional_path_for(resolved_region, redirect_path)
          end

          setup_region(resolved_region)
        elsif Cdo::GlobalEdition::PATH_PATTERN.match?(request.path)
          main_path = request_path_vars(:main_path).first
          request.path_info = main_path unless existing_route?
          setup_redirect_to(request.query_string.empty? ? main_path : "#{main_path}?#{request.query_string}") if redirectable?
          setup_region(nil)
        end

        response.finish
      ensure
        # Restore the original `script_name` and `path_info` so that upstream middlewares
        # (e.g., VarnishEnvironment's after filter) see a consistent `request.path`.
        # Without this, downstream processing may partially restore `path_info` while
        # leaving `script_name` modified, causing a doubled GE prefix in `request.path`.
        request.script_name = original_script_name
        request.path_info   = original_path_info

        RequestStore.store.delete(Cdo::GlobalEdition::REGION_KEY)
      end

      # @note Once the `response` instance is initialized, any changes to the `request` made afterward will not be applied.
      private def response
        @response ||= Rack::Response[*app.call(env)]
      end

      # Extracts named components from the request path using the Global Edition path pattern.
      #
      # Matches the current request path against `Cdo::GlobalEdition::PATH_PATTERN`
      # and returns the values of the requested named capture groups.
      #
      # @param keys [Array<Symbol>] names of capture groups to extract
      #   Available options:
      #   - :ge_region  region code extracted from the path (e.g., "fa")
      #   - :ge_prefix  full Global Edition prefix (e.g., "/global/fa")
      #   - :main_path  remaining path after the prefix (e.g., "/home")
      # @return [Array<String, nil>] values corresponding to the requested keys in order,
      #   or an empty array if the path does not match
      #
      # @example For path "/global/fa/home"
      #   request_path_vars(:ge_region, :ge_prefix, :main_path) => ["fa", "/global/fa", "/home"]
      private def request_path_vars(*keys)
        Cdo::GlobalEdition::PATH_PATTERN.match(request.path)&.values_at(*keys) || []
      end

      # Resolves and memoizes the effective Global Edition region for the request.
      #
      # @return [String, nil] resolved region code (e.g., "fa"), or nil if none is valid
      private def resolved_region
        return @resolved_region if defined? @resolved_region

        @resolved_region = begin
          # Extract region from URL (e.g., "/global/fa" => "fa")
          url_region = request_path_vars(:ge_region).first

          # Initial candidate regions in priority order
          regions = [current_region, url_region]

          if current_locale
            locale_regions = Cdo::GlobalEdition.locales_regions[current_locale]
            # If locale has no associated regions, no valid region can be resolved
            return if locale_regions.blank?

            # Keep only regions compatible with the locale
            regions &= locale_regions
            # Add all locale regions as fallback options
            regions += locale_regions
          end

          regions.find {|region| Cdo::GlobalEdition.region_available?(region)}
        end
      end

      private def setup_region(new_region)
        # Resets the region if it's `nil` or sets it only if it's available.
        return unless new_region.nil? || Cdo::GlobalEdition.region_available?(new_region)

        # Sets the request cookies to apply changes immediately without needing to reload the page.
        request.cookies[REGION_KEY] = RequestStore.store[Cdo::GlobalEdition::REGION_KEY] = new_region
        request.cookies[LOCALE_KEY] = request.locale = new_locale = site_locale(new_region)

        # Updates the global `ge_region` cookie to lock the platform to the regional version.
        set_global_cookie(REGION_KEY, new_region, high_priority: true)
        # Updates the global `language` cookie to enforce the switch to the regional language.
        set_locale_cookie(new_locale)

        unless new_region == current_region
          Metrics::Events.log_event(
            event_name: 'Global Edition Region Changed',
            user: request.user,
            session: request.session,
            metadata: {
              old_region: current_region,
              old_locale: current_locale,
              new_region:,
              new_locale:,
            },
          )
        end
      end

      private def existing_route?(path = request.path_info)
        return false unless request.hostname == CDO.dashboard_hostname
        request_method = request.params['_method'].presence || request.request_method
        Dashboard::Application.routes.recognize_path(path, method: request_method).present?
      rescue ActionController::RoutingError
        false
      end

      private def site_locale(region)
        site_locale = current_locale

        if Cdo::GlobalEdition.region_available?(region)
          unless Cdo::GlobalEdition.locale_available?(region, site_locale)
            site_locale = Cdo::GlobalEdition.main_region_locale(region)
          end
        else
          # Locales locked to a specific region should not be set during a region reset.
          site_locale = nil if Cdo::GlobalEdition.locales_regions[site_locale].present?
        end

        site_locale
      end

      private def excluded_path?(path)
        EXCLUDED_PATHS.any? {|excluded_path| path.match?(excluded_path)}
      end

      # Determines if the request is eligible for redirection.
      # To improve efficiency, the redirection should only affect the browser's address bar,
      # avoiding redirection for non-visible to user requests such as AJAX, non-GET, or asset requests.
      private def redirectable?
        return false unless request.get? # only GET request can be redirected
        return false if request.xhr? # only non-AJAX requests should be redirected

        !excluded_path?(request.path)
      end

      private def regional_path_for(region, main_path)
        Cdo::GlobalEdition.path(region, main_path.to_s)
      end

      private def setup_redirect_to(redirect_path)
        response.do_not_cache!
        response.redirect ::File.join('/', redirect_path.to_s)
      end
    end

    def initialize(app)
      @app = app
    end

    def call(env)
      return process_request(env) if global_edition_enabled?(env)
      @app.call(env)
    end

    private def global_edition_enabled?(env)
      DCDO.get('global_edition_enabled', false) && Cdo::GlobalEdition.target_host?(Rack::Request.new(env).hostname)
    end

    private def process_request(env)
      RouteHandler.new(@app, env).call
    rescue StandardError => exception
      raise exception if CDO.rack_env?(:development)

      Honeybadger.notify(
        exception,
        error_message: '[Middleware::GlobalEdition] Runtime error',
        context: {
          env: env,
        }
      )

      @app.call(env)
    end
  end
end
