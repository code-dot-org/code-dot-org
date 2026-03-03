require 'sinatra/base'
require 'http_accept_language'

require 'cdo/global_edition'
require 'cdo/i18n'
require 'cdo/rack/global_edition'
require 'helpers/cookies'

require_relative '../../dashboard/lib/metrics/events' # rubocop:disable CustomCops/DashboardRequires

class VarnishEnvironment < Sinatra::Base
  LOCALE_PARAM_KEY = 'set_locale'.freeze
  SUPPORTED_LOCALES = ::Cdo::I18n.available_languages.map {_1[:locale_s].downcase}.sort.freeze
  FALLBACK_LOCALES = Cdo::I18n::LOCALE_CONFIGS.each_with_object({}) {|(k, v), h| h[k.downcase] = v.downcase if v.is_a?(String)}.freeze

  before do
    request.locale = param_locale || varnish_locale || cookie_locale || http_locale || default_locale
  end

  after do
    if param_locale
      set_locale_cookie(param_locale)

      redirect_uri = URI(request.path)
      redirect_params = request.params.except(LOCALE_PARAM_KEY)

      if Cdo::GlobalEdition.locale_available?(request.ge_region, param_locale)
        # Logs the region that will be set based on the selected locale.
        locale_ge_region = Cdo::GlobalEdition.region_locked_locales[param_locale]
        log_ge_region_select_event(locale_ge_region) if locale_ge_region && locale_ge_region != request.ge_region
      else
        # Resets Global Edition region if the locale is not available for the region.
        redirect_params[Rack::GlobalEdition::REGION_KEY] = nil
        log_ge_region_select_event(nil)
      end

      redirect_uri.query = URI.encode_www_form(redirect_params).presence

      response.redirect(redirect_uri.to_s)
    end
  end

  helpers do
    include Middleware::Helpers::Cookies

    def varnish_locale
      language_to_locale(request.env['HTTP_X_VARNISH_ACCEPT_LANGUAGE'])
    end

    def cookie_locale
      language_to_locale(request.cookies[LOCALE_KEY])
    end

    def param_locale
      language_to_locale(request.params[LOCALE_PARAM_KEY])
    end

    def default_locale
      Cdo::I18n::DEFAULT_LOCALE
    end

    # Determines the most appropriate locale based on the browser's Accept-Language header.
    def http_locale
      http_accept_language_parser = HttpAcceptLanguage::Parser.new(env['HTTP_ACCEPT_LANGUAGE'])
      http_accept_language_parser.user_preferred_languages.lazy.map {language_to_locale(_1)}.find(&:itself)
    end

    # @return BCP 47 language tag (a normalized locale suitable for I18n e.g. `en-US` or `es-MX`)
    def language_to_locale(language)
      locale = language.to_s.downcase
      return if locale.empty?

      unless SUPPORTED_LOCALES.include?(locale)
        fallback = FALLBACK_LOCALES[locale]
        return fallback ? language_to_locale(fallback) : nil
      end

      lang, region = locale.split('-', 2)
      region ? "#{lang}-#{region.upcase}" : lang
    end

    def log_ge_region_select_event(ge_region)
      Metrics::Events.log_event(
        event_name: 'Global Edition Region Selected',
        user: env['warden']&.user,
        session: request.session,
        metadata: {
          region: ge_region,
          locale: param_locale,
        }
      )
    end
  end
end
