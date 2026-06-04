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

    LOCALE_CONFIGS = YAML.load_file(CDO.dir('config/i18n/locales.yml')).each do |_locale, data|
      data.symbolize_keys! if data.is_a?(Hash)
    end.freeze

    # Mapping of short locale codes to normalized I18n locale codes (e.g., 'en' => 'en-US').
    LOCALE_ALIASES = LOCALE_CONFIGS.each_with_object({}) {|(k, v), h| h[k] = v if v.is_a?(String)}.freeze

    # Mapping locale codes to their fallback locale codes (e.g., 'en-IN' => 'en-US').
    LOCALE_FALLBACKS = LOCALE_CONFIGS.each_with_object({}) do |(k, v), h|
      h[k] = v[:fallback] if v.is_a?(Hash) && v[:fallback]
    end.freeze

    # Mapping LocalizeJS locale codes to normalized I18n locale codes (e.g., 'zh-Hans' => 'zh-CN').
    LOCALIZE_TO_I18N_LOCALES = LANGUAGES.each_with_object({}) do |cdo_language, locales|
      locales[cdo_language[:localize_code_s]] = cdo_language[:locale_s] if cdo_language[:localize_code_s]
    end.freeze

    # Mapping normalized I18n locale codes to LocalizeJS locale codes (e.g., 'zh-CN' => 'zh-Hans').
    # The inverse of LOCALIZE_TO_I18N_LOCALES.
    I18N_TO_LOCALIZE_LOCALES = LANGUAGES.each_with_object({}) do |cdo_language, locales|
      locales[cdo_language[:locale_s]] = cdo_language[:localize_code_s] if cdo_language[:localize_code_s]
    end.freeze

    # Mapping of LocalizeJS project keys to the URL path prefixes they serve.
    # Pages matching a prefix render in English and load the LocalizeJS widget.
    LOCALIZE_PROJECTS = YAML.load_file(CDO.dir('config/i18n/localizejs.yml')).freeze

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

      # Returns the LocalizeJS project key whose configured path prefix matches
      # the given request path, or nil if the page is not a LocalizeJS page.
      #
      # A single optional leading path segment is permitted so that
      # locale/region-prefixed URLs (e.g. `/fa/courses/csd-2024`) still match.
      #
      # @param path [String] the request path (e.g. `/courses/csd-2024`)
      # @return [String, nil] the matching LocalizeJS project key, or nil
      def localize_project_key(path)
        LOCALIZE_PROJECTS.each do |project_key, prefixes|
          return project_key if prefixes.any? do |prefix|
            path.match?(%r{\A(?:/[^/]+)?#{Regexp.escape(prefix)}})
          end
        end
        nil
      end

      # Returns the LocalizeJS locale code for the given I18n locale (e.g.
      # 'zh-CN' => 'zh-Hans', 'es-LA' => 'es-LA'), so the frontend can ask
      # LocalizeJS to switch to the language the backend resolved from the
      # `language_` cookie / Global Edition region. Falls back to the locale
      # itself when no explicit LocalizeJS code is configured.
      #
      # @param locale [String, Symbol] a normalized I18n locale (e.g. 'es-LA')
      # @return [String] the corresponding LocalizeJS locale code
      def localize_locale_code(locale)
        I18N_TO_LOCALIZE_LOCALES[locale.to_s] || locale.to_s
      end

      # @param cdo_language [CdoLanguage] CDO language record
      # @return [Boolean] whether the language is a debug language
      private def debug_language?(cdo_language)
        LOCALE_CONFIGS.dig(cdo_language[:locale_s], :debug)
      end
    end
  end
end
