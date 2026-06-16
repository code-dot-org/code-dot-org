require File.expand_path('../../../../dashboard/config/environment', __FILE__)
require 'i18n'

# Provides access to all the translations managed by the code-dot-org project.
class TranslationService
  def initialize
    # Normally we fallback to en-US, but we want to disable this so we detect missing strings.
    I18n.fallbacks.defaults = []
    I18n.backend.reload!
    store_frontend_translations
  end

  # Returns true if a translation exists for a given key, otherwise returns false.
  def translated?(locale, key, scope = "")
    if scope == ""
      I18n.exists?(key, locale: locale)
    else
      !I18n.t(key, scope: JSON.parse(scope), smart: true, tracking: false).include?("translation missing")
    end
  end

  # Aggregate all frontend i18n strings to be loaded into I18n backend
  def store_frontend_translations
    Dir.glob(apps_dir('lib/blockly/*.js')) do |i18n_filepath|
      locale = File.basename(i18n_filepath, '.js').sub('_', '-').sub(/-(\w+)$/) {"-#{$1.upcase}"}
      translations = {}
      File.foreach(i18n_filepath) do |line|
        # Parses lines like `Blockly.Msg.ADD_COMMENT = "Add Comment";`
        # into key/value pairs: `ADD_COMMENT` => `Add Comment`.
        match = line.match(/\ABlockly\.Msg\.([A-Z0-9_]+)\s*=\s*(['"])(.*?)\2;/)
        translations[match[1]] = match[3] if match
      end
      I18n.backend.store_translations(locale, {'core' => translations}) unless translations.empty?
    end

    Dir.glob(apps_dir('i18n/**/*.json')) do |i18n_filepath|
      locale = File.basename(i18n_filepath, '.json').sub('_', '-').sub(/-(\w+)$/) {"-#{$1.upcase}"}
      name = File.basename(File.dirname(i18n_filepath))
      translations = JSON.parse(File.read(i18n_filepath)).to_h
      I18n.backend.store_translations(locale, {name => translations}) unless translations.empty?
    end
  end
end
