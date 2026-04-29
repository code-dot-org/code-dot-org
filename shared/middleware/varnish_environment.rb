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
    set_locale_cookie(http_locale) if cookie_locale.nil? && http_locale
  ensure
    request.locale = cookie_locale || default_locale
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

    def cookie_locale
      language_to_locale(request.cookies[LOCALE_KEY])
    end

    def param_locale
      language_to_locale(request.params[LOCALE_PARAM_KEY])
    end

    def default_locale
      Cdo::I18n::DEFAULT_LOCALE
    end

    # Resolves the preferred locale from the `HTTP_ACCEPT_LANGUAGE` header.
    # Languages are ordered by quality and mapped via {#language_to_locale}.
    #
    # @return [String, nil] the first supported locale or nil if none matches
    def http_locale
      http_locales_qualities = env['HTTP_ACCEPT_LANGUAGE'].to_s.gsub(/\s+/, '').split(',').each_with_object({}) do |language, hash|
        locale, quality = language.split(';q=')

        next if locale == '*'
        next unless /^[a-z\-0-9]+|\*$/i.match?(locale)

        hash[locale.downcase] = quality ? quality.to_f : 1.0
      end

      http_locales_qualities.sort_by {|_l, q| -q}.lazy.map {|l, _q| language_to_locale(l)}.find(&:itself)
    rescue ArgumentError
      nil
    end

    # @return BCP 47 language tag (a normalized locale suitable for I18n e.g. `en-US` or `es-MX`)
    def language_to_locale(language)
      language = language.to_s

      locale = Cdo::I18n::LOCALE_ALIASES[language] || language
      return unless settings.locales_supported.include?(locale.downcase)

      locale.sub(/-(.+)\z/, &:upcase)
    rescue ArgumentError
      nil
    end
  end
end
