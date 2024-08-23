require 'i18n'
require 'active_support/core_ext/numeric/bytes'

module Cdo
  module I18n
    module SmartTranslate
      # if called with the :smart option, attempt to improve the given options
      def translate(locale, key, options = ::I18n::EMPTY_HASH)
        if options.fetch(:smart, false)
          options = SmartTranslate.get_smart_translate_options(locale, key, options)
        end

        super(locale, key, options)
      end

      def self.get_smart_translate_options(locale, key, options = ::I18n::EMPTY_HASH)
        options = options.dup
        options.delete(:smart)

        # If I18n.t was called with an explicit scope and without specifying a
        # separator, try to find a separator character that isn't contained within
        # any of the individual scope or key values, to prevent a situation in
        # which periods in a key name can be mistakenly interpreted as separators
        if options.key?(:scope) && !options.key?(:separator)
          combined_key = [key] + options.fetch(:scope, [])
          options[:separator] = get_valid_separator(combined_key.join)
        end

        options
      end

      # Potential characters to use as a separator. This list can be safely
      # expanded if the current set proves insufficient
      SEPARATORS = ".|,-_ /".chars

      # Return a character than can be used as a separator without separating the
      # given string. If the given string contains all the attempted separator
      # values, returns nil.
      #
      # Ex:
      #
      #   get_valid_separator("plain") -> "."
      #   get_valid_separator("string.with.dots") -> "|"
      #   get_valid_separator("string.with|dots.and|pipe") -> ","
      #   etc
      #
      # Used for to make sure that dynamically-provided values can safely be used
      # as the I18n key.
      def self.get_valid_separator(string)
        characters = string.chars.to_set
        SEPARATORS.find do |separator|
          !characters.include? separator
        end
      end
    end

    module MarkdownTranslate
      # If called with the :markdown option, render the translation as
      # markdown. Note we use Redcarpet's Safe renderer to protect against XSS
      # injection, which also means we don't support using this option with
      # source strings that include HTML
      def translate(locale, key, options = ::I18n::EMPTY_HASH)
        translation = super(locale, key, options.except(:markdown))
        markdown = options.fetch(:markdown, false)
        case markdown
        when true
          # The safe_links_only just makes sure that the URL is a "safe" web
          # one which starts with: "#", "/", "http://", "https://", "ftp://",
          # "mailto:" However, it isn't good enough because it ignores URLS
          # which are just '/' or start with '//'.  Although I couldn't find
          # documentation about what "safe" means, I think its meant to limit
          # URLs to using known safe ones because the future is unknown.
          # Imagine someone on Crowdin changing the URL to be
          # "bitcoin://send.coin/to/evil-account". It's hard to predict what
          # future URLs will be like, so its easier to just filter for the
          # currently known ones. The actual "safe" think we should be doing is
          # redacting all URLs in strings given to outside translators.
          @renderer ||= Redcarpet::Markdown.new(Redcarpet::Render::Safe.new(safe_links_only: false))
          @renderer.render(translation)
        when :inline
          @inline_renderer ||= Redcarpet::Markdown.new(Redcarpet::Render::Inline.new(filter_html: true))
          @inline_renderer.render(translation)
        else
          translation
        end
      end
    end

    module SafeInterpolation
      def initialize(...)
        super

        # Override the default handler for the "missing interpolation argument"
        # error case; default handler raises an error which will result in a
        # 500.  We expect to end up in this situation when a string once had an
        # interpolation argument but does no longer, and an old translation
        # from when the string did have that argument was mistakenly applied to
        # the new version of the string.
        #
        # Unfortunately, this will only actually happen when either there are
        # multiple interpolation arguments in the string and only some of them
        # are being used, or when there are extra arguments being passed to the
        # I18n.t call; we want behavior to be consistent in any situation, so
        # we update the handler here to simply return the original
        # interpolation value.
        #
        # We could alternatively use something else (the name of the key, for
        # example) as the default argument, or even fall back to the English
        # version of the string, but we would also want to update the case
        # where interpolation syntax goes entirely unused to match.
        #
        # TODO: explore the above-mentioned alternative.
        #
        # see: https://github.com/ruby-i18n/i18n/blob/6f3d428a5a0055ce61c5d069ce4782c4d1958bf8/lib/i18n/config.rb#L103-L116
        ::I18n.config.missing_interpolation_argument_handler = proc do |key|
          "%{#{key}}"
        end
      end

      def translate(locale, key, options = ::I18n::EMPTY_HASH)
        result = super(locale, key, options)
        return result if options[:safe_interpolation] == false

        # Log unused interpolation arguments to honeybadger; these are likely
        # the result of translations mistakenly including interpolation syntax
        # that was removed in the source string and we want to be notified so
        # we can update the translation.
        if result.is_a?(String) && Regexp.union(::I18n.config.interpolation_patterns).match?(result)
          Harness.error_notify(
            error_class: 'Interpolation Pattern present in translation',
            error_message: "String #{result.inspect} has unused interpolation patterns after translation",
            context: {
              key: key,
              locale: locale,
              options: options,
              result: result,
            }
          )
        end
        result
      end
    end

    module Plugins
      include SmartTranslate
      include MarkdownTranslate
      include SafeInterpolation
    end

    class SimpleBackend < ::I18n::Backend::Simple
      include Plugins
    end

    # The class extends the `LazyLoadable` backend from the i18n gem to support CDO i18n files:
    # - Modified the `LocaleExtractor` class to support filenames that include both a prefix and the locale (e.g., "courses.en-US.yml").
    # - Modified the `filenames_for_current_locale` method to load files for the current locale and its fallbacks, (e.g, "en" for "en-US" and vice versa)
    # - Modified the `eager_load!` method to ignore eager loading when lazy loading is enabled.
    # - Modified the `assert_file_named_correctly!` method to check if a filename corresponds to the locale it loaded.
    # - Implemented a mechanism to avoid reloading already loaded translation files.
    # https://github.com/ruby-i18n/i18n/blob/v1.12.0/lib/i18n/backend/lazy_loadable.rb
    class LazyLoadableBackend < ::I18n::Backend::LazyLoadable
      include Plugins

      LOCALES_MAPPING = YAML.load_file(CDO.dir('dashboard/config/locales.yml')).each_with_object({}) do |(k, v), locales|
        locales[k.to_sym] = v.to_sym if v.is_a?(String)
      end.freeze

      # The original method has been modified to work on i18n files named with a prefix and the locale,
      # like "common.en.yml" or "common.en-US.json" and not only on files named with the locale, like "en-US.json".
      # https://github.com/ruby-i18n/i18n/blob/v1.12.0/lib/i18n/backend/lazy_loadable.rb#L55-L63
      class ::I18n::Backend::LocaleExtractor
        def self.locale_from_path(path)
          # Extracts the locale from the path, like "en", "en-US", "haw", "haw-HI", etc.
          path[/\b([a-z]{2,3}(?:-[A-Z]{2})?)\b\.\w+$/, 1]&.to_sym
        end
      end

      def load_translations(*files)
        loaded_files.merge(files.flatten) if lazy_load?
        super
      end

      def reload!
        if lazy_load?
          @loaded_files = nil
          @valid_locales = nil
        end

        super
      end

      def eager_load!
        # Ignores eager loading instead of raising an error if lazy loading is enabled
        super unless lazy_load?
      end

      protected def loaded_files
        @loaded_files ||= Set.new
      end

      # Get the set of valid locales for a given base locale code. For example,
      # for a base of `:pt`, we expect valid locales `:pt`, `:"pt-BR"`, `:"en-US"`, and `en`
      protected def valid_locales_for(base_locale)
        @valid_locales ||= {}

        unless @valid_locales[base_locale]
          @valid_locales[base_locale] = Set.new(::I18n.fallbacks[base_locale])
          @valid_locales[base_locale] << base_locale
          @valid_locales[base_locale] << LOCALES_MAPPING[base_locale] # en: :'en-US'
          @valid_locales[base_locale] = @valid_locales[base_locale].compact_blank
        end

        @valid_locales[base_locale]
      end

      # The original method has been modified to also load files for the current locale's fallbacks,
      # like loading "en-US" files for the "en" locale and vice versa.
      # https://github.com/ruby-i18n/i18n/blob/v1.12.0/lib/i18n/backend/lazy_loadable.rb#L164-L171
      protected def filenames_for_current_locale
        valid_locales = valid_locales_for(::I18n.locale)
        # Excludes already loaded i18n files to prevent them from being reloaded during locale switching.
        # For example, for the "de-DE" locale, the i18n fallbacks are "de", "en", and "en-US".
        # Since "en-US" (and "en") is the default locale, its i18n files are already loaded.
        (::I18n.load_path.flatten - loaded_files.to_a).select do |path|
          path_locale = ::I18n::Backend::LocaleExtractor.locale_from_path(path)
          path_locale.nil? || valid_locales.include?(path_locale)
        end
      end

      # Checks if a filename corresponds to the locale it has loaded.
      # The locale extracted from the path must be either the single locale loaded in
      # the translations or one of the expected variations of the locale, taking into
      # account both long locale codes and fallbacks.
      #
      # The original implementation was changed from raising an error to logging
      # the details to the console, because the error isn't all that critical
      # to catch and the new loading logic includes more weird edge cases.
      # https://github.com/ruby-i18n/i18n/blob/v1.12.0/lib/i18n/backend/lazy_loadable.rb#L173-L181
      protected def assert_file_named_correctly!(file, translations)
        expected_locale = ::I18n::Backend::LocaleExtractor.locale_from_path(file)
        return if expected_locale.nil?

        valid_locales = valid_locales_for(expected_locale)
        unexpected_locales = translations.each_key.reject {|locale| valid_locales.include?(locale.to_sym)}
        return if unexpected_locales.empty?

        warn "INVALID I18N: File #{file.inspect} contains translations for unexpected locale".yellow
        warn "       valid: #{valid_locales.inspect}".blue
        warn "    expected: #{expected_locale.inspect}".green
        warn "  unexpected: #{unexpected_locales.inspect}".red
      end
    end
  end
end

CDO_I18N_BACKEND = Cdo::I18n::SimpleBackend.new
