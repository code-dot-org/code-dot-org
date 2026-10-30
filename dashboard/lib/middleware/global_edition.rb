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

      # HTTP path prefixes that should be processed as is, without a Global Edition regional redirect.
      def self.non_redirectable_path_prefixes
        @non_redirectable_path_prefixes ||= %w[
          /api/
          /dashboardapi/
        ].freeze
      end

      attr_reader :app, :env, :request, :original_script_name, :original_path_info, :original_path,
                  :cookie_region, :cookie_locale, :current_locale

      def initialize(app, env)
        @app = app
        @env = env

        @request = ActionDispatch::Request.new(@env)
        @original_script_name = @request.script_name
        @original_path_info   = @request.path_info
        @original_path        = @request.path
        @cookie_region        = @request.cookies[REGION_KEY].presence
        @cookie_locale        = @request.cookies[LOCALE_KEY].presence
        @current_locale       = ::I18n.locale.to_s
      end

      # Processes the current request within the Global Edition routing context.
      #
      # Non-dashboard hosts and excluded paths bypass this middleware. Other requests
      # first handle an explicit `?ge_region=<region_code>` override, then the legacy
      # `/global/fa/*` fallback, then the effective region selected from the current
      # locale, stored region cookie, URL region, and default region.
      #
      # Resolution may rewrite `request.script_name` and `request.path_info` so Rails
      # can route a regional URL through its underlying non-prefixed route while URL
      # helpers still emit the active regional prefix. It may also set the regional
      # request state, update region and locale cookies, or return a redirect when a
      # visible GET request should move to its canonical regional URL.
      def call
        return app.call(env) unless request.hostname == CDO.dashboard_hostname
        return app.call(env) if Cdo::GlobalEdition.excluded_path?(request.path)

        # Allows setting the GE region via the URL parameter `?ge_region=<region_code>`.
        if request.GET.key?(REGION_KEY)
          new_region = request.GET[REGION_KEY].presence

          redirect_path =
            if new_region.nil? || Cdo::GlobalEdition.region_available?(new_region)
              regional_path_for(new_region, original_path)
            else
              original_path
            end

          redirect_uri = URI(redirect_path)
          redirect_uri.query = URI.encode_www_form(request.GET.except(REGION_KEY)).presence
          redirect_path = ActionDispatch::Journey::Router::Utils.normalize_path(redirect_uri.to_s)

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
          # Strips the GE region prefix so Rails matches `/la/home` as `/home`.
          request.path_info = main_path unless existing_route?

          unless Cdo::GlobalEdition.excluded_path?(main_path)
            regional_path = regional_path_for(effective_region, main_path)

            if original_path_info == regional_path
              # Moves the GE region prefix, e.g. `/la`, into `script_name`.
              # Rails treats `script_name` as the mounted path prefix outside `path_info`,
              # so it can match the root route while preserving the GE prefix in generated URLs.
              request.script_name = regional_path_for(effective_region, original_script_name) unless existing_route?
            elsif redirectable?
              setup_redirect_to request.query_string.empty? ? regional_path : "#{regional_path}?#{request.query_string}"
            end

            setup_region(effective_region)
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
        @path_match = Cdo::GlobalEdition.match_path(original_path_info)
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
      # @example
      #   `/in/en/home` => `/home`
      #
      # @return [String] path without GE prefix, or the original path if no prefix is present
      private def main_path
        @main_path ||= path_match.try(:[], :main_path) || original_path_info
      end

      # Resolves the available region by priority.
      #
      # @return [String, nil] region code, or nil if no region is available
      private def available_region
        @available_region ||= [cookie_region, url_region, Cdo::GlobalEdition::DEFAULT_REGION].find do |region|
          Cdo::GlobalEdition.region_available?(region)
        end
      end

      # Determines and memoizes the effective Global Edition region for the request.
      #
      # @return [String, nil] resolved region code (e.g., "fa"), or nil if none is valid
      private def effective_region
        @effective_region ||=
          # Prefer the URL region until the user selects a region/language.
          if cookie_locale.nil? && url_region && url_region == available_region
            url_region
          elsif current_locale
            locale_region = Cdo::GlobalEdition.locale_region(current_locale)
            Cdo::GlobalEdition.region_available?(locale_region) ? locale_region : available_region
          else
            available_region
          end
      end

      private def setup_region(new_region)
        # Resets the region if it's `nil` or sets it only if it's available.
        return unless new_region.nil? || Cdo::GlobalEdition.region_available?(new_region)

        Cdo::GlobalEdition.current_region = new_region
        ::I18n.locale = region_locale = resolve_locale_for(new_region)

        response.set_cdo_cookie(REGION_KEY, new_region, priority: :high) unless cookie_region == new_region
        response.set_cdo_cookie(LOCALE_KEY, region_locale)               unless cookie_locale == region_locale
      end

      private def existing_route?
        return @existing_route if defined?(@existing_route)
        @existing_route = Dashboard::Application.routes.recognize_path_with_request(
          request,
          original_path_info,
          {},
          raise_on_missing: false
        ).present?
      end

      # Resolves the most appropriate locale for the given region.
      #
      # @param region [String, nil] The target Global Edition region code.
      # @return [String] The resolved locale for the region,
      #   or the default locale during a region reset.
      private def resolve_locale_for(region)
        return Cdo::GlobalEdition::DEFAULT_LOCALE unless region

        return current_locale if Cdo::GlobalEdition.locale_available?(region, current_locale)
        return url_locale     if Cdo::GlobalEdition.locale_available?(region, url_locale)

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
        return false if original_path.start_with?(*self.class.non_redirectable_path_prefixes)

        true
      end

      private def regional_path_for(region, main_path)
        Cdo::GlobalEdition.path(region, main_path, locale: resolve_locale_for(region))
      end

      private def setup_redirect_to(redirect_path)
        @redirect_response ||= Rack::Response.new
        @redirect_response.do_not_cache!
        @redirect_response.redirect ActionDispatch::Journey::Router::Utils.normalize_path(redirect_path)
      end
    end

    private_constant :RequestGlobalizer
  end
end
