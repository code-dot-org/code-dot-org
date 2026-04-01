require 'sinatra/base'

require 'cdo/global_edition'
require 'cdo/i18n'
require 'helpers/cookies'

require_relative '../../dashboard/lib/metrics/events' # rubocop:disable CustomCops/DashboardRequires

class VarnishEnvironment < Sinatra::Base
  LOCALE_PARAM_KEY = 'set_locale'.freeze

  def self.load_supported_locales
    ::Cdo::I18n.available_languages.map {|cdo_language| cdo_language[:locale_s].downcase}.sort
  end

  configure do
    set :locales_supported, load_supported_locales
  end

  before do
    request.locale = param_locale || varnish_locale || cookie_locale || default_locale
  end

  after do
    if param_locale
      set_locale_cookie(param_locale)

      redirect_uri = URI(request.path)
      redirect_params = request.params.except(LOCALE_PARAM_KEY)
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

    def language_to_locale(language)
      case language
      when 'en'
        return 'en-US'
      when 'es'
        return 'es-ES'
      when 'fa'
        return 'fa-IR'
      else
        language = begin
          language.to_s.downcase
        rescue ArgumentError
          ""
        end
        return nil unless locale = settings.locales_supported.find {|i| i == language || i.split('-').first == language}
        parts = locale.split('-')
        return "#{parts[0].downcase}-#{parts[1].upcase}"
      end
    end
  end
end
