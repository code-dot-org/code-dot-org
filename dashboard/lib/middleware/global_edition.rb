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

      attr_reader :app, :env, :request, :original_script_name, :original_path_info, :original_path, :original_region,
                  :original_locale

      def initialize(app, env)
        @app = app
        @env = env

        @request = Rack::Request.new(@env)
        @original_script_name = @request.script_name
        @original_path_info   = @request.path_info
        @original_path        = @request.path
        @original_region      = @request.cookies[REGION_KEY].presence
        @original_locale      = @request.locale
      end

      # Processes the current request within the Global Edition routing context.
      #
      # Inspects the incoming request, determines whether the request should remain on the current URL,
      # be internally rewritten, or be redirected to a different Global Edition or international URL,
      # and applies the corresponding region and locale state before the downstream app is invoked.
      #
      # The resolution flow is:
      # 1. If the request explicitly provides `?ge_region=<region_code>`, that value is
      #    treated as an explicit region override. The region is updated, the locale is
      #    recalculated for that region, and the request is redirected to the same path
      #    without the `ge_region` query parameter.
      # 2. Otherwise, if an `effective_region` can be resolved from the current locale,
      #    stored region, and URL region, the request is resolved for that region:
      #    - If the resolved region already matches the URL region, the original request
      #      is handled in place.
      #    - Otherwise, the request is redirected or rewritten to the resolved regional URL.
      # 3. If the URL contains a region but no `effective_region` can be determined:
      #    - If the URL region is valid and the user has not yet selected a preferred
      #      language, the request adopts the URL region and resolves in place.
      #    - Otherwise, the request falls back to the international version.
      #
      # During resolution, this method may:
      # - rewrite `request.script_name` and `request.path_info` so the application can
      #   process a regional URL as its underlying non-prefixed route
      # - set or clear Global Edition region and locale cookies
      # - update request scoped region state in `RequestStore`
      # - emit a redirect response when the browser URL must change
      #
      # @return [Array(Integer, Hash, #each)] the Rack response returned by `response.finish`
      def call
        # Allows setting the GE region via the URL parameter `?ge_region=<region_code>`.
        if request.params.key?(REGION_KEY)
          new_region = request.params[REGION_KEY].presence

          redirect_path = ::File.join('/', main_path)
          redirect_path = regional_path_for(new_region, redirect_path) if Cdo::GlobalEdition.region_available?(new_region)

          redirect_uri = URI(redirect_path)
          redirect_uri.query = URI.encode_www_form(request.params.except(REGION_KEY)).presence
          redirect_path = redirect_uri.to_s

          setup_region(new_region)
          setup_redirect_to(redirect_path)
        # Fallback legacy `/global/fa/*` path
        elsif original_path_info.start_with?('/global/fa')
          international_path = original_path_info.sub('/global/fa', '')
          request.path_info = international_path unless existing_route?

          if redirectable?(international_path)
            fallback_path = regional_path_for('fa', international_path)
            fallback_path = "#{fallback_path}?#{request.query_string}" if request.query_string.present?
            setup_redirect_to(fallback_path)
          end

          setup_region('fa')
        elsif effective_region
          if effective_region == url_region
            normalize_request_for_routing
          else
            redirect_request_to_region(effective_region)
          end
        elsif url_region
          # If the user visits a regional URL and has not yet selected a preferred language,
          # automatically set their preferred region and language based on the URL's region.
          if Cdo::GlobalEdition.region_available?(url_region) && request.cookies[LOCALE_KEY].blank?
            normalize_request_for_routing
          else
            redirect_request_to_region(nil)
          end
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

      private def url_data
        return @url_data if defined?(@url_data)
        @url_data = Cdo::GlobalEdition::PATH_PATTERN.match(original_path)
      end

      private def url_region
        return @url_region if defined?(@url_region)
        @url_region = url_data.try(:[], :ge_region).presence
      end

      # Returns the request path with the Global Edition (GE) prefix removed.
      #
      # @example `/fa/home` => `/home`
      #
      # @return [String] path without GE prefix, or the original path if no prefix is present
      private def main_path
        @main_path ||= url_data.try(:[], :main_path) || original_path
      end

      private def main_fullpath
        @main_fullpath ||= request.query_string.empty? ? main_path : "#{main_path}?#{request.query_string}"
      end

      # Determines and memoizes the effective Global Edition region for the request.
      #
      # @return [String, nil] resolved region code (e.g., "fa"), or nil if none is valid
      private def effective_region
        return @effective_region if defined?(@effective_region)

        @effective_region =
          if original_locale
            locale_regions = Cdo::GlobalEdition.locales_regions[original_locale]
            return if locale_regions.blank?

            return original_region if locale_regions.include?(original_region)
            return url_region      if locale_regions.include?(url_region)

            locale_regions.first
          else
            return original_region if Cdo::GlobalEdition.region_available?(original_region)
            return url_region      if Cdo::GlobalEdition.region_available?(url_region)

            nil
          end
      end

      private def setup_region(new_region)
        return if new_region == original_region

        # Resets the region if it's `nil` or sets it only if it's available.
        return unless new_region.nil? || Cdo::GlobalEdition.region_available?(new_region)

        # Sets the request cookies to apply changes immediately without needing to reload the page.
        request.cookies[REGION_KEY] = RequestStore.store[Cdo::GlobalEdition::REGION_KEY] = new_region
        request.cookies[LOCALE_KEY] = request.locale = new_locale = site_locale(new_region)

        # Updates the global `ge_region` cookie to lock the platform to the regional version.
        set_global_cookie(REGION_KEY, new_region, high_priority: true)
        # Updates the global `language` cookie to enforce the switch to the regional language.
        set_locale_cookie(new_locale)

        Metrics::Events.log_event(
          event_name: 'Global Edition Region Changed',
          user: request.user,
          session: request.session,
          metadata: {
            old_region: original_region,
            old_locale: original_locale,
            new_region:,
            new_locale:,
          },
        )
      end

      private def existing_route?(path = original_path_info)
        return false unless request.hostname == CDO.dashboard_hostname
        request_method = request.params['_method'].presence || request.request_method
        Dashboard::Application.routes.recognize_path(path, method: request_method).present?
      rescue ActionController::RoutingError
        false
      end

      private def site_locale(region)
        site_locale = original_locale

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
      private def redirectable?(path = original_path)
        return false unless request.get? # only GET request can be redirected
        return false if request.xhr? # only non-AJAX requests should be redirected

        !excluded_path?(path)
      end

      private def regional_path_for(region, main_path)
        Cdo::GlobalEdition.path(region, main_path.to_s)
      end

      private def setup_redirect_to(redirect_path)
        response.do_not_cache!
        response.redirect ::File.join('/', redirect_path.to_s)
      end

      # Prepares the current request so it can be correctly routed by the application.
      #
      # This method adapts incoming Global Edition URLs (e.g., `/<ge-region>/...`)
      # into a form that the application can process as standard root level routes.
      # Without this normalization, such requests would not match any route and result in a 404.
      #
      # Behavior:
      # - If the request does not match an existing route, adjusts Rack path components:
      #   - Updates `request.script_name` to account for the regional prefix so the app
      #     behaves as if mounted under that path.
      #   - Replaces `request.path_info` with the main path (without the GE prefix),
      #     allowing the router to resolve it correctly.
      # - Skips rewriting for excluded paths.
      # - Applies the resolved region context via `setup_region`.
      #
      # @note This method performs an internal request transformation only.
      #   It does not trigger a redirect or modify the browser URL.
      private def normalize_request_for_routing
        unless existing_route?
          # Strips the Global Edition path prefix (e.g., `/fa`) from the request path.
          # request.path == request.script_name + request.path_info
          # - `request.script_name` strips the prefix from the request path
          #   so the application processes requests as if it were running at the root level.
          # - `request.path_info` provides the specific path that should be handled by the application.
          request.script_name = regional_path_for(url_region, original_script_name).chomp('/') unless excluded_path?(main_path)
          request.path_info   = main_path
        end

        setup_region(url_region)
      end

      # Redirects the request to the appropriate regional or international URL.
      #
      # This method determines the correct destination URL based on the provided region
      # and prepares a redirect response if necessary. It ensures that the browser URL
      # reflects the resolved Global Edition state.
      #
      # Behavior:
      # - If the request does not match an existing route, normalizes `request.path_info`
      #   to the main path (without GE prefix) to ensure consistency.
      # - If the request is eligible for redirect (`redirectable?`):
      #   - Redirects to a region-specific URL when `region` is present.
      #   - Redirects to the international (non-regional) URL when `region` is nil.
      # - Applies the resolved region context via `setup_region`.
      #
      # @param region [String, nil] region code (e.g., "fa"), or nil to indicate fallback to the international version
      #
      # @note This method prepares a redirect response but does not immediately halt execution;
      #       the response is finalized later in the middleware lifecycle.
      private def redirect_request_to_region(region)
        request.path_info = main_path unless existing_route?
        setup_redirect_to(region ? regional_path_for(region, main_fullpath) : main_fullpath) if redirectable?
        setup_region(region)
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
      raise exception if CDO.rack_env?(:development) || CDO.rack_env?(:test)

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
