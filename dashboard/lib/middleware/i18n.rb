# frozen_string_literal: true

require 'uri'
require 'cdo/i18n'
require 'cdo/rack/response'

module Middleware
  class I18n
    LOCALE_COOKIE_KEY = Cdo::I18n::LOCALE_COOKIE_KEY
    LOCALE_PARAM_KEY = Cdo::I18n::LOCALE_PARAM_KEY

    def initialize(app)
      @app = app
    end

    def call(env)
      RequestLocalizer.new(@app, env).call
    end

    class RequestLocalizer
      attr_reader :app, :env, :request, :response

      def initialize(app, env)
        @app = app
        @env = env

        @request  = Rack::Request.new(@env)
        @response = Rack::Response.new
      end

      def call
        if param_locale
          redirect_uri = URI(request.path)
          redirect_uri.query = request.GET.except(LOCALE_PARAM_KEY).to_query.presence

          response.redirect redirect_uri.to_s
          response.do_not_cache!

          set_cookies(param_locale)

          response.finish
        else
          ::I18n.with_locale(cookie_locale || http_locale) do
            response.status, headers, response.body = app.call(env)
            response.headers.merge!(headers)

            # Persist the locale this request actually resolved to, INCLUDING any
            # change made downstream by Global Edition region coordination (which
            # assigns `::I18n.locale` directly). Persisting the initially-resolved
            # locale here would clobber a region locale -- e.g. es-LA that GE just
            # set -- back to the browser/default locale, dropping the visitor out
            # of their Global Edition region on the next request.
            #
            # But do NOT mint a `language_` cookie for a visitor who never selected
            # one just because we rendered in the default locale. A spurious cookie
            # looks like an explicit choice to Global Edition, which would then
            # bounce the visitor out of a region-prefixed URL (e.g. /fa/...) they
            # have not opted into. Only persist a real selection: one resolved from
            # the request, or a non-default locale assigned downstream by GE.
            locale = ::I18n.locale.to_s
            selected = cookie_locale || http_locale
            if locale != cookie_locale && (selected.present? || locale != ::I18n.default_locale.to_s)
              set_cookies(locale)
            end

            response.finish
          end
        end
      end

      private def set_cookies(locale)
        request.cookies[LOCALE_COOKIE_KEY] = locale
        response.set_cdo_cookie(LOCALE_COOKIE_KEY, locale)
      end

      private def resolve_locale(locale)
        return if locale.blank?

        locale = locale.to_s.downcase.sub(/-(.+)\z/, &:upcase)
        locale = Cdo::I18n::LOCALE_ALIASES[locale] || locale
        return unless Cdo::I18n.available_locale?(locale)

        locale
      rescue ArgumentError
        nil
      end

      private def param_locale
        @param_locale ||= resolve_locale(request.GET[LOCALE_PARAM_KEY])
      end

      private def cookie_locale
        return @cookie_locale if defined?(@cookie_locale)
        @cookie_locale = resolve_locale(request.cookies[LOCALE_COOKIE_KEY])
      end

      # Resolves the preferred locale from the `HTTP_ACCEPT_LANGUAGE` header.
      # Languages are ordered by quality and mapped via {#resolve_locale}.
      #
      # @return [String, nil] the first supported locale or nil if none matches
      private def http_locale
        http_locales_qualities = env['HTTP_ACCEPT_LANGUAGE'].to_s.gsub(/\s+/, '').split(',').each_with_object({}) do |language, hash|
          locale, quality = language.split(';q=')

          next if locale == '*'
          next unless /^[a-z\-0-9]+|\*$/i.match?(locale)

          hash[locale] = quality ? quality.to_f : 1.0
        end

        http_locales_qualities.sort_by {|_l, q| -q}.lazy.map {|l, _q| resolve_locale(l)}.find(&:itself)
      rescue ArgumentError
        nil
      end
    end

    private_constant :RequestLocalizer

    # Renders LocalizeJS pages in English -- the source language -- so the
    # LocalizeJS widget can translate them client-side.
    #
    # This MUST be inserted inside Middleware::GlobalEdition (see
    # dashboard/config/application.rb). Global Edition coordinates the region and
    # the `language_` / `ge_region` cookies using the request's real locale (for
    # example es-LA for the LatAm edition); if we switched to English any further
    # out, GE would conclude the visitor isn't in their region and redirect them
    # out of it. By running inside GE we change ONLY the downstream render.
    #
    # The project key is stashed in the Rack env for the i18n/_localizejs partial
    # (see ApplicationController#load_localize_js_config). The frontend reads the
    # visitor's language from the `language_` cookie itself, so nothing per-visitor
    # is embedded in the (cacheable) page. The real locale is recorded as
    # Cdo::I18n.intended_locale so backend code can still tell what the visitor
    # intends even while we render in English.
    class LocalizeJS
      ENV_KEY = 'cdo.localize_js'

      def initialize(app)
        @app = app
      end

      def call(env)
        project_key = Cdo::I18n.localize_project_key(Rack::Request.new(env).path)
        return @app.call(env) unless project_key

        env[ENV_KEY] = {project_key: project_key}
        Cdo::I18n.intended_locale = ::I18n.locale
        ::I18n.with_locale(::I18n.default_locale) {@app.call(env)}
      ensure
        Cdo::I18n.intended_locale = nil
      end
    end
  end
end
