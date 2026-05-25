# frozen_string_literal: true

require 'omniauth'
require 'request_store'
require 'i18n'

require 'cdo/global_edition'
require 'cdo/i18n'
require 'cdo/rack/response'
require 'dynamic_config/dcdo'

module Middleware
  class GlobalEdition
    def initialize(app)
      @app = app
    end

    def call(env)
      RequestGlobalizer.new(@app, env).call
    end

    class RequestGlobalizer
      REGION_KEY = Cdo::GlobalEdition::REGION_KEY
      LOCALE_KEY = Cdo::I18n::LOCALE_COOKIE_KEY

      # HTTP path prefixes to be excluded from Global Edition scope.
      def self.excluded_path_prefixes
        @excluded_path_prefixes ||= [
          Rails.application.config.assets.prefix + '/', # e.g. `/assets/`
          '/public/',
          # To make an OAuth callback accessible, it must be added to the whitelist of each SSO provider.
          # Instead of repeating this process for each new Global Edition region,
          # it is more efficient to remove the Global Edition prefix and treat the request as a standard route.
          # Additionally, preventing OAuth routes from being redirected, ensuring the authentication process is not disrupted.
          ::OmniAuth.config.path_prefix + '/', # e.g. `/users/auth/`
          # Exclude HoC legacy API routes from Global Edition scope.
          ::HocLegacy::API_ROOT_PATH + '/', # e.g. `/api/hour/`
          # Exclude health check routes such as `/health_check`.
          Rails.application.routes.url_helpers.health_check_path,
          Rails.application.routes.url_helpers.home_health_check_path,
        ].freeze
      end

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
        @original_locale      = ::I18n.locale.to_s
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
        return app.call(env) unless Cdo::GlobalEdition.target_host?(request.hostname)
        return app.call(env) if excluded_path?(request.path)

        # Allows setting the GE region via the URL parameter `?ge_region=<region_code>`.
        if request.GET.key?(REGION_KEY)
          new_region = request.GET[REGION_KEY].presence

          redirect_path = ::File.join('/', main_path)
          redirect_path = regional_path_for(new_region, redirect_path) if Cdo::GlobalEdition.region_available?(new_region)

          redirect_uri = URI(redirect_path)
          redirect_uri.query = URI.encode_www_form(request.GET.except(REGION_KEY)).presence
          redirect_path = redirect_uri.to_s

          setup_redirect_to(redirect_path)
          setup_region(new_region)
        # Fallback for legacy `/global/fa/*` paths
        elsif original_path_info.start_with?('/global/fa') && !existing_route?
          international_path = original_path_info.sub('/global/fa', '')
          request.path_info = international_path

          if redirectable?
            fallback_path = regional_path_for('fa', international_path)
            fallback_path = "#{fallback_path}?#{request.query_string}" if request.query_string.present?
            setup_redirect_to(fallback_path)
          end
        elsif effective_region
          if url_region == effective_region && (url_locale.nil? || url_locale == original_locale)
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
        Cdo::GlobalEdition.current_region = nil
        # GE may rewrite Rack routing state (`script_name`, `path_info`) to route `/<region>/...` as root paths.
        # Rack computes `request.path` from both fields (`script_name + path_info`), so we must restore both values.
        # If only one side is reverted, upstream middleware can observe an invalid path (for example, a duplicated GE prefix).
        request.script_name = original_script_name
        request.path_info   = original_path_info
      end

      private def response
        return @redirect_response if @redirect_response
        @response ||= Rack::Response[*app.call(env)]
      end

      private def path_match
        return @path_match if defined?(@path_match)
        @path_match = Cdo::GlobalEdition.match_path(original_path)
      end

      private def url_region
        return @url_region if defined?(@url_region)
        @url_region = path_match.try(:[], :region).presence
      end

      private def url_locale
        return @url_locale if defined?(@url_locale)
        url_locale_segment = path_match.try(:[], :locale).presence
        @url_locale = url_locale_segment && Cdo::GlobalEdition.resolve_region_locale(url_region, url_locale_segment)
      end

      # Returns the request path with the Global Edition (GE) prefix removed.
      #
      # @example `/fa/home` => `/home`
      #
      # @return [String] path without GE prefix, or the original path if no prefix is present
      private def main_path
        @main_path ||= path_match.try(:[], :main_path) || original_path
      end

      private def main_fullpath
        @main_fullpath ||= request.query_string.empty? ? main_path : "#{main_path}?#{request.query_string}"
      end

      private def locale_region(locale)
        locale_regions = Cdo::GlobalEdition.locales_regions[locale]
        locale_regions = locale_regions&.select {|region| Cdo::GlobalEdition.region_available?(region)}
        return if locale_regions.blank?

        return original_region if locale_regions.include?(original_region)
        return url_region      if locale_regions.include?(url_region)

        locale_regions.first
      end

      private def available_region
        return original_region if Cdo::GlobalEdition.region_available?(original_region)
        return url_region      if Cdo::GlobalEdition.region_available?(url_region)

        nil
      end

      # Determines and memoizes the effective Global Edition region for the request.
      #
      # @return [String, nil] resolved region code (e.g., "fa"), or nil if none is valid
      private def effective_region
        @effective_region ||= original_locale ? locale_region(original_locale) : available_region
      end

      private def setup_region(new_region)
        # Resets the region if it's `nil` or sets it only if it's available.
        return unless new_region.nil? || Cdo::GlobalEdition.region_available?(new_region)

        Cdo::GlobalEdition.current_region = new_region
        return if new_region == original_region

        # Updates the global `ge_region` cookie to lock the platform to the regional version.
        request.cookies[REGION_KEY] = new_region
        response.set_cdo_cookie(REGION_KEY, new_region, priority: :high)

        region_locale = resolve_locale_for(new_region)
        unless region_locale == original_locale
          # Updates the global `language` cookie to enforce the switch to the regional language.
          ::I18n.locale = region_locale
          request.cookies[LOCALE_KEY] = region_locale
          response.set_cdo_cookie(LOCALE_KEY, region_locale)
        end

        Metrics::Events.log_event(
          event_name: 'Global Edition Region Changed',
          user: request.user,
          session: request.session,
          metadata: {
            old_region: original_region,
            old_locale: original_locale,
            new_region:,
            new_locale: region_locale,
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

      # Resolves the most appropriate locale for the given region.
      #
      # @param region [String, nil] The target Global Edition region code.
      # @return [String, nil] The resolved locale for the region,
      #   or `nil` if no locale should be preserved during a region reset.
      private def resolve_locale_for(region)
        return original_locale unless region

        return original_locale if Cdo::GlobalEdition.locale_available?(region, original_locale)
        return url_locale      if Cdo::GlobalEdition.locale_available?(region, url_locale)

        Cdo::GlobalEdition.main_region_locale(region)
      end

      private def excluded_path?(path)
        path.start_with?(*self.class.excluded_path_prefixes)
      end

      # Determines if the request is eligible for redirection.
      # To improve efficiency, the redirection should only affect the browser's address bar,
      # avoiding redirection for non-visible to user requests such as AJAX, non-GET, or asset requests.
      private def redirectable?
        return false unless request.get? # only GET request can be redirected
        return false if request.xhr? # only non-AJAX requests should be redirected

        true
      end

      private def regional_path_for(region, main_path)
        Cdo::GlobalEdition.path(region, main_path.to_s, locale: resolve_locale_for(region))
      end

      private def setup_redirect_to(redirect_path)
        @redirect_response ||= Rack::Response.new
        @redirect_response.do_not_cache!
        @redirect_response.redirect ::File.join('/', redirect_path.to_s)
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

    private_constant :RequestGlobalizer
  end
end
