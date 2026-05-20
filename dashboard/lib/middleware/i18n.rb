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
          ::I18n.with_locale(locale = cookie_locale || http_locale) do
            response.status, headers, response.body = app.call(env)
            response.headers.merge!(headers)

            set_cookies(locale) unless cookie_locale == locale

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
  end
end
