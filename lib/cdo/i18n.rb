# frozen_string_literal: true

require 'csv'
require 'i18n'
require 'uri'
require 'yaml'

require 'cdo/shared_constants'

module Cdo
  module I18n
    DEFAULT_LOCALE = SharedConstants::DEFAULT_LOCALE

    # @see https://docs.google.com/spreadsheets/d/10dS5PJKRt846ol9f9L3pKh03JfZkN7UIEcwMmiGS4i0
    CDO_LANGUAGES = CSV.read(CDO.dir('pegasus/data/cdo-languages.csv'), headers: true, header_converters: :symbol).freeze

    LOCALE_CONFIGS = YAML.load_file(CDO.dir('config/i18n/locales.yml')).each do |_locale, data|
      data.symbolize_keys! if data.is_a?(Hash)
    end.freeze

    TEXT_DIRECTIONS = Set[
      TEXT_DIRECTION_LTR = 'ltr', # the left-to-right text direction
      TEXT_DIRECTION_RTL = 'rtl', # the right-to-left text direction
    ].freeze

    class << self
      def available_languages
        @available_languages ||= CDO_LANGUAGES.filter_map do |cdo_language|
          next cdo_language if cdo_language[:supported_codeorg_b] == 'TRUE'
          # Enables languages available for debugging in all non-production environments
          cdo_language if debug_language?(cdo_language) && !CDO.rack_env?(:production)
        end.freeze
      end

      def available_languages_by_locale
        @available_languages_by_locale ||= available_languages.index_by {|cdo_language| cdo_language[:locale_s]}.freeze
      end

      def available_locale?(locale)
        available_languages_by_locale.key?(locale.to_s)
      end

      def language_name(locale)
        cdo_language = available_languages_by_locale[locale.to_s]
        return unless cdo_language

        language_name = cdo_language[:native_name_s]

        if debug_language?(cdo_language) && (cdo_language[:supported_codeorg_b] != 'TRUE' || !CDO.rack_env?(:production))
          language_name = "#{language_name} DBG"
        end

        language_name
      end

      def js_locale(locale)
        locale.to_s.downcase.tr('-', '_')
      end

      def locale_options
        @locale_options ||= available_languages.map do |cdo_language|
          [language_name(cdo_language[:locale_s]), cdo_language[:locale_s]]
        end.sort_by(&:second).freeze
      end

      def locale_direction(locale)
        LOCALE_CONFIGS.dig(locale.to_s, :dir) || TEXT_DIRECTION_LTR
      end

      def language_change_url(url, locale)
        uri = URI.parse(url)

        params = URI.decode_www_form(uri.query.to_s).to_h
        params[VarnishEnvironment::LOCALE_PARAM_KEY] = locale
        uri.query = URI.encode_www_form(params)

        uri.to_s
      end

      # @param cdo_language [CdoLanguage] CDO language record
      # @return [Boolean] whether the language is a debug language
      private def debug_language?(cdo_language)
        LOCALE_CONFIGS.dig(cdo_language[:locale_s], :debug)
      end
    end
  end
end
