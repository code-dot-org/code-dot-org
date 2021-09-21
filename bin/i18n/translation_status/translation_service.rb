require File.expand_path('../../../../dashboard/config/environment', __FILE__)
require File.expand_path('../../../../pegasus/src/env', __FILE__)
require 'i18n'

# Provides access to all the translations managed by the code-dot-org project.
class TranslationService
  def initialize
    store_frontend_translations
    # Normally we fallback to en-US, but we want to disable this so we detect missing strings.
    I18n.fallbacks.defaults = []
    I18n.backend.reload!
  end

  # Returns true if a translation exists for a given key, otherwise returns false.
  def translated?(locale, key)
    I18n.exists?(key, locale: locale)
  end

  # Aggregate all blockly-mooc translation JSON files to be loaded into i18n
  def store_frontend_translations
    locales_dir = Rails.root.join("../i18n/locales")
    locales = Dir.glob(locales_dir.join("*")).map {|dir| File.basename(dir)}
    locales.each do |locale|
      translations = {}
      Dir.glob(locales_dir.join("#{locale}/blockly-mooc/*.json")).each do |loc_file|
        name = File.basename(loc_file, ".*")
        puts name if locale.include? "de"
        translations[name] = JSON.load(File.read(loc_file)).to_h
      end
      I18n.backend.store_translations(locale, translations)
    end
    puts I18n.exists?("turtle.loopVariable", locale: "de-DE")
    puts I18n.exists?("tutorialExplorer.startButton", locale: "tr-TR")
    puts I18n.exists?("turtle.loopVariable", locale: "tr-TR")

    puts "***"
    puts translated?('de-DE', 'turtle.loopVariable')
    puts translated?('de-DE', 'turtle.fill')
  end
end
