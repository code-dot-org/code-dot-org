require 'i18n'
require 'active_support/core_ext/numeric/bytes'
require 'cdo/key_value'

module Cdo
  # TODO: (elijah) enable this for the backend as a whole, and remove the
  # pathwork implementation in blockly.rb.
  #
  # See https://github.com/code-dot-org/code-dot-org/blob/14bc4168b8526a65bccf3780fa6a2822bff02c60/lib/cdo/i18n_backend.rb
  module I18nSmartTranslate
    # if called with the :smart option, attempt to improve the given options
    def translate(locale, key, options = I18n::EMPTY_HASH)
      if options.fetch(:smart, false)
        options = I18nSmartTranslate.get_smart_translate_options(locale, key, options)
      end

      super(locale, key, options)
    end

    def self.get_smart_translate_options(locale, key, options = I18n::EMPTY_HASH)
      options = options.dup
      options.delete(:smart)

      # If I18n.t was called with an explicit scope and without specifying a
      # separator, try to find a separator character that isn't contained within
      # any of the individual scope or key values, to prevent a situation in
      # which periods in a key name can be mistakenly interpreted as separators
      if options.key?(:scope) && !options.key?(:separator)
        options[:separator] = get_valid_separator(key + options[:scope].join(''))
      end

      options
    end

    # Potential characters to use as a separator. This list can be safely
    # expanded if the current set proves insufficient
    SEPARATORS = ".|,-_ /".split('')

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
      characters = string.split('').to_set
      SEPARATORS.each do |separator|
        return separator unless characters.include? separator
      end

      nil
    end
  end

  # I18n backend instance used by the web application.
  class I18nBackend < ::I18n::Backend::KeyValue
    include ::I18n::Backend::CacheFile

    CACHE_DIR = pegasus_dir('cache', 'i18n/cache')

    def initialize
      store = KeyValue.new(CACHE_DIR)
      super(store, false)
      self.path_roots = [Gem.dir, deploy_dir]
    end

    def load_translations(*filenames)
      @loading = true
      super
      store.flush
      @loading = false
    end

    alias init_translations load_translations
    alias reload! load_translations

    def store_translations(*args)
      super.tap {store.flush unless @loading}
    end
  end
end
# Use custom i18n backend by enabling `CDO.i18n_key_value`.
# Default false during testing and controlled roll-out.
CDO.i18n_backend = CDO.with_default(false).i18n_key_value ?
  Cdo::I18nBackend.new :
  I18n::Backend::Simple.new
