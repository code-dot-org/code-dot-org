# frozen_string_literal: true

require 'uri'
require 'cdo/i18n'
require 'helpers/cookies'

module Middleware
  class I18n
    LOCALE_PARAM_KEY = 'set_locale'

    def initialize(app)
      @app = app
    end

    def call(env)
      RequestHandler.new(@app, env).call
    end

    class RequestHandler
      include Middleware::Helpers::Cookies

      attr_reader :app, :env, :request

      def initialize(app, env)
        @app = app
        @env = env

        @request = Rack::Request.new(@env)
      end

      def call
        locale = param_locale || cookie_locale || http_locale

        ::I18n.with_locale(locale) do
          set_locale_cookie(locale) unless cookie_locale == locale

          if param_locale
            redirect_uri = URI(request.path)
            redirect_params = request.GET.except(LOCALE_PARAM_KEY)
            redirect_uri.query = URI.encode_www_form(redirect_params).presence

            response.do_not_cache!
            response.redirect redirect_uri.to_s
          end

          response.finish
        end
      end

      private def response
        @response ||= Rack::Response[*app.call(env)]
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
        return @param_locale if defined?(@param_locale)
        @param_locale = resolve_locale(request.GET[LOCALE_PARAM_KEY])
      end

      private def cookie_locale
        return @cookie_locale if defined?(@cookie_locale)
        @cookie_locale = resolve_locale(request.cookies[LOCALE_KEY])
      end

      # Resolves the preferred locale from the `HTTP_ACCEPT_LANGUAGE` header.
      # Languages are ordered by quality and mapped via {#resolve_locale}.
      #
      # @return [String, nil] the first supported locale or nil if none matches
      private def http_locale
        return @http_locale if defined?(@http_locale)

        http_locales_qualities = env['HTTP_ACCEPT_LANGUAGE'].to_s.gsub(/\s+/, '').split(',').each_with_object({}) do |language, hash|
          locale, quality = language.split(';q=')

          next if locale == '*'
          next unless /^[a-z\-0-9]+|\*$/i.match?(locale)

          hash[locale] = quality ? quality.to_f : 1.0
        end

        @http_locale = http_locales_qualities.sort_by {|_l, q| -q}.lazy.map {|l, _q| resolve_locale(l)}.find(&:itself)
      rescue ArgumentError
        @http_locale = nil
      end
    end
  end
end
