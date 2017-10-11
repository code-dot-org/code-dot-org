require 'i18n/backend/simple'

# I18n backend that lazy-loads translations from locale-specific YAML files.
class LazyLocaleBackend < I18n::Backend::Simple
  def init_translations
    @initialized = true
  end

  def reload!
    super
    @loaded_locales = []
  end

  def available_locales
    @locales ||= I18n.load_path.map do |file|
      match = file.match(/([^.\/]*)\.yml/)
      match && match[1]
    end.compact.uniq
  end

  def lookup(locale, *args)
    load_locale(locale)
    super(locale, *args)
  end

  LOAD_MUTEX = Mutex.new
  def load_locale(locale)
    LOAD_MUTEX.synchronize do
      @loaded_locales ||= []
      return if @loaded_locales.include?(locale)

      if @loaded_locales.empty?
        load_translations(I18n.load_path.grep(/\.rb$/))
      end

      load_translations(I18n.load_path.grep(/(\/|\.)#{Regexp.escape locale}\.yml$/))

      @loaded_locales << locale
    end
  end
end
