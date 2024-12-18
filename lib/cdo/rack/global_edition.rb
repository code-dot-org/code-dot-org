# frozen_string_literal: true

require 'active_support/all'
require 'request_store'

require 'cdo/global_edition'
require 'cdo/honeybadger'
require 'dynamic_config/dcdo'
require 'helpers/cookies'

module Rack
  class GlobalEdition
    REGION_KEY = Cdo::GlobalEdition::REGION_KEY

    class RouteHandler
      include Middleware::Helpers::Cookies

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

      attr_reader :app, :env

      def initialize(app, env)
        @app = app
        @env = env
      end

      # @note Changes to the `request` should be made before the `response` is initialized to apply the changes.
      def call
        if request.params.key?(REGION_KEY)
          new_region = request.params[REGION_KEY].presence

          redirect_path = ::File.join('/', request_path_vars(:main_path).first || request.path)
          redirect_path = regional_path_for(new_region, redirect_path) if Cdo::GlobalEdition.region_available?(new_region)

          redirect_uri = URI(redirect_path)
          redirect_uri.query = URI.encode_www_form(request.params.except(REGION_KEY)).presence
          redirect_path = redirect_uri.to_s

          setup_region(new_region)
          setup_redirect_to(redirect_path)
        elsif PATH_PATTERN.match?(request.path_info)
          ge_prefix, ge_region, main_path = request_path_vars(:ge_prefix, :ge_region, :main_path)

          if Cdo::GlobalEdition.region_available?(ge_region) && dashboard_route?(main_path)
            # Strips the Global Edition path prefix (e.g., `/global/fa`) from the request path.
            # request.path == request.script_name + request.path_info
            # - `request.script_name` strips the prefix from the request path
            #   so the application processes requests as if it were running at the root level.
            # - `request.path_info` provides the specific path that should be handled by the application.
            request.script_name = ::File.join(ge_prefix, request.script_name).chomp('/')
            request.path_info = main_path
          end

          setup_region(ge_region)
        elsif Cdo::GlobalEdition.region_available?(request.cookies[REGION_KEY])
          # Redirects to the regional version if it is available.
          setup_region_redirect(request.cookies[REGION_KEY])
        elsif (locale_region = Cdo::GlobalEdition.region_locked_locales[request.cookies[LOCALE_KEY]])
          # Redirects to the regional version of the locale if it is possible.
          setup_region_redirect(locale_region)
        end

        response.finish
      ensure
        RequestStore.store.delete(Cdo::GlobalEdition::REGION_KEY)
      end

      private def request
        @request ||= Rack::Request.new(env)
      end

      # @note Once the `response` instance is initialized, any changes to the `request` made afterward will not be applied.
      private def response
        @response ||= begin
          RequestStore.store[Cdo::GlobalEdition::REGION_KEY] = request.cookies[REGION_KEY].presence
          Rack::Response[*app.call(env)]
        end
      end

      private def request_path_vars(*keys)
        PATH_PATTERN.match(request.path_info)&.values_at(*keys) || []
      end

      private def setup_region(region)
        # Resets the region if it's `nil` or sets it only if it's available.
        return unless region.nil? || Cdo::GlobalEdition.region_available?(region)

        # Sets the request cookies to apply changes immediately without needing to reload the page.
        request.cookies[REGION_KEY] = region
        request.cookies[LOCALE_KEY] = request.locale = site_locale(region)

        # Updates the global `ge_region` cookie to lock the platform to the regional version.
        set_global_cookie(REGION_KEY, region, high_priority: true)
        # Updates the global `language` cookie to enforce the switch to the regional language.
        set_locale_cookie(request.cookies[LOCALE_KEY].presence)
      end

      private def dashboard_route?(path = request.path)
        return false unless request.hostname == CDO.dashboard_hostname
        Dashboard::Application.routes.recognize_path(path, method: request.request_method).present?
      rescue ActionController::RoutingError
        false
      end

      private def pegasus_helpers
        @pegasus_helpers ||= begin
          pegasus_app = Documents.new
          pegasus_app.helpers.setup_for(request)
          pegasus_app.helpers
        end
      end

      private def pegasus_route?(path = request.path)
        return false unless request.hostname == CDO.pegasus_hostname
        path = URI(path).path
        pegasus_helpers.resolve_document(path).present? || pegasus_helpers.resolve_view_template(path).present?
      rescue StandardError
        false
      end

      private def site_locale(region)
        site_locale = request.cookies[LOCALE_KEY]

        if Cdo::GlobalEdition.region_available?(region)
          unless Cdo::GlobalEdition.locale_available?(region, site_locale)
            site_locale = Cdo::GlobalEdition.main_region_locale(region)
          end
        else
          # Locales locked to a specific region should not be set during a region reset.
          site_locale = nil if Cdo::GlobalEdition.region_locked_locales[site_locale]
        end

        site_locale
      end

      # Determines if the request is eligible for redirection.
      # To improve efficiency, the redirection should only affect the browser's address bar,
      # avoiding redirection for non-visible to user requests such as AJAX, non-GET, or asset requests.
      private def redirectable?(redirect_path)
        return false unless request.get? # only GET request can be redirected
        return false if request.xhr? # only non-AJAX requests should be redirected

        # Unlike in Dashboard, where any route can be dynamically changed to a regional version,
        # Pegasus requires an existing regional template.
        dashboard_route? || pegasus_route?(redirect_path)
      end

      private def regional_path_for(region, main_path)
        redirect_path = ::File.join(ROOT_PATH, region, main_path)

        # Pegasus requires a predefined template for each path, unlike Dashboard, which manages paths dynamically.
        redirect_path = ::File.join(ROOT_PATH, region) if pegasus_route?(main_path) && !pegasus_route?(redirect_path)

        redirect_path
      end

      private def setup_redirect_to(redirect_path)
        response.do_not_cache!
        response.redirect(redirect_path)
      end

      private def setup_region_redirect(region)
        redirect_path = regional_path_for(region, request.fullpath)
        setup_redirect_to(redirect_path) if redirectable?(redirect_path)
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
      DCDO.get('global_edition_enabled', false) && Cdo::GlobalEdition.target_host?(Request.new(env).hostname)
    end

    private def process_request(env)
      RouteHandler.new(@app, env).call
    rescue StandardError => exception
      raise exception if CDO.rack_env?(:development)

      Honeybadger.notify(
        exception,
        error_message: '[Rack::GlobalEdition] Runtime error',
        context: {
          env: env,
        }
      )

      @app.call(env)
    end
  end
end
