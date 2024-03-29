require 'i18n'
require 'active_support/core_ext/numeric/bytes'
require 'cdo/honeybadger'
require 'cdo/i18n_string_url_tracker'

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
          Honeybadger.notify(
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

    # Plugin for logging usage information about i18n strings.
    module I18nStringUrlTrackerPlugin
      def translate(locale, key, options = ::I18n::EMPTY_HASH)
        result = super
        # If we don't want to track this string lookup, just return the translation
        # :tracking is assumed to be true unless explicitly set to false.
        # :tracking is a custom flag we added to skip i18n string tracking for this translation
        # lookup.
        return result if options[:tracking] == false

        url = Thread.current[:current_request_url]
        scope = options[:scope]
        # Note that the separator here might not cover some edge cases. If we find that the separator used here is not
        # sufficient, then refactor the SmartTranslate module so we can use `get_valid_separator` here.
        separator = options[:separator] || ::I18n.default_separator
        # We don't pass in a locale because we want the union of all string keys across all locales.
        I18nStringUrlTracker.instance.log(url, 'ruby', key, scope, separator) if key && url
        result
      end
    end

    module Plugins
      include SmartTranslate
      include MarkdownTranslate
      include SafeInterpolation
      include I18nStringUrlTrackerPlugin
    end

    class SimpleBackend < ::I18n::Backend::Simple
      include Plugins
    end

    class LazyLoadableBackend < ::I18n::Backend::LazyLoadable
      include Plugins

      LOCALES_MAPPING = YAML.load_file(CDO.dir('dashboard/config/locales.yml')).each_with_object({}) do |(k, v), locales|
        locales[k.to_sym] = v.to_sym if v.is_a?(String)
      end.freeze

      class ::I18n::Backend::LocaleExtractor
        def self.locale_from_path(path)
          # Extracts the locale name from the path, like "en", "en-US", "haw", "haw-HI", etc.
          path[/\b([a-z]{2,3}(?:-[A-Z]{2})?)\b\.\w+$/, 1]&.to_sym
        end
      end

      def load_translations(*files)
        loaded_files.merge(files.flatten) if lazy_load?
        super
      end

      def reload!
        @loaded_files = nil if lazy_load?
        super
      end

      def eager_load!
        # Ignores eager loading instead of raising an error if lazy loading is enabled
        super unless lazy_load?
      end

      protected

      def loaded_files
        @loaded_files ||= Set.new
      end

      def filenames_for_current_locale
        valid_locales = Set.new(::I18n.fallbacks[::I18n.locale])
        valid_locales << LOCALES_MAPPING[::I18n.locale] # en: :'en-US'
        valid_locales.compact_blank

        (::I18n.load_path.flatten - loaded_files.to_a).select do |path|
          path_locale = ::I18n::Backend::LocaleExtractor.locale_from_path(path)
          path_locale.nil? || valid_locales.include?(path_locale)
        end
      end

      # Prevents from raising an error when the locale in the filename and
      # the root locale key in the file content mismatch,
      # like when `en.yml` has a root locale key of `en-US:` instead of `en:`
      def assert_file_named_correctly!(...)
      end
    end
  end
end

CDO_I18N_BACKEND = Cdo::I18n::SimpleBackend.new
