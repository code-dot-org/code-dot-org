# frozen_string_literal: true

require 'csv'
require 'i18n'
require 'uri'
require 'yaml'

module Cdo
  module I18n
    DEFAULT_LOCALE = 'en-US'

    LOCALE_COOKIE_KEY = 'language_'
    LOCALE_PARAM_KEY = 'set_locale'

    LANGUAGES = CSV.read(CDO.dir('config/i18n/cdo-languages.csv'), headers: true, header_converters: :symbol).freeze

    LOCALE_CONFIGS = YAML.load_file(CDO.dir('config/i18n/locales.yml')).each {_2.symbolize_keys!.freeze if _2.is_a?(Hash)}.freeze

    # Mapping of short locale codes to normalized I18n locale codes (e.g., 'en' => 'en-US').
    LOCALE_ALIASES = LOCALE_CONFIGS.each_with_object({}) {|(k, v), h| h[k] = v if v.is_a?(String)}.freeze

    # Mapping locale codes to their fallback locale codes (e.g., 'en-IN' => 'en-US').
    LOCALE_FALLBACKS = LOCALE_CONFIGS.each_with_object({}) {|(k, v), h| h[k] = v[:fallback] if v.is_a?(Hash) && v[:fallback]}.freeze

    # Mapping LocalizeJS locale codes to normalized I18n locale codes (e.g., 'zh-Hans' => 'zh-CN').
    LOCALIZE_TO_I18N_LOCALES = LANGUAGES.each_with_object({}) do |cdo_language, locales|
      locales[cdo_language[:localize_code_s]] = cdo_language[:locale_s] if cdo_language[:localize_code_s]
    end.freeze

    TEXT_DIRECTIONS = Set[
      TEXT_DIRECTION_LTR = 'ltr', # the left-to-right text direction
      TEXT_DIRECTION_RTL = 'rtl', # the right-to-left text direction
    ].freeze

    class << self
      def available_languages
        @available_languages ||= LANGUAGES.filter_map do |cdo_language|
          cdo_language = cdo_language.to_h
          next cdo_language if cdo_language[:supported_codeorg_b] == 'TRUE'
          # Enables languages available for debugging in all non-production environments
          cdo_language if debug_language?(cdo_language) && !CDO.rack_env?(:production)
        end.freeze
      end

      def available_languages_by_locale
        @available_languages_by_locale ||= available_languages.to_h {[_1[:locale_s], _1.freeze]}.freeze
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
        @locale_options ||= available_languages.map {[language_name(_1[:locale_s]), _1[:locale_s]]}.sort_by(&:second).freeze
      end

      def locale_direction(locale)
        LOCALE_CONFIGS.dig(locale.to_s, :dir) || TEXT_DIRECTION_LTR
      end

      # @param cdo_language [CdoLanguage] CDO language record
      # @return [Boolean] whether the language is a debug language
      private def debug_language?(cdo_language)
        LOCALE_CONFIGS.dig(cdo_language[:locale_s], :debug)
      end
    end
  end
end
