require File.expand_path('../boot', __FILE__)
require 'rails/all'
require File.expand_path('../deployment', __FILE__)

require 'cdo/geocoder'

require 'bootstrap-sass'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module Dashboard
  class Application < Rails::Application

    config.encoding = 'utf-8'

    config.generators do |g|
      g.template_engine :haml
    end
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # By default, config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    config.i18n.enforce_available_locales = false
    config.i18n.available_locales = ['en']
    config.i18n.fallbacks = {}
    config.i18n.default_locale = 'en-us'
    locales = YAML.load_file("#{Rails.root}/config/locales.yml")
    LOCALES = Hash[locales.map {|k, v| [k.downcase, v.class == String ? v.downcase : v]}]
    LOCALES.each do |locale, data|
      next unless data.is_a? Hash
      data.symbolize_keys!
      unless data[:debug] && Rails.env.production?
        config.i18n.available_locales << locale
      end
      if data[:fallback]
        config.i18n.fallbacks[locale] = data[:fallback]
      end
    end

    config.prize_providers = YAML.load_file("#{Rails.root}/config/prize_providers.yml")

    # Hack for cache busting.
    # Extracts version number from package.json of Blockly apps.
    # See also LevelsHelper#blockly_cache_bust.
    cache_bust_path = Rails.root.join('.cache_bust')
    ::CACHE_BUST = File.read(cache_bust_path).strip.gsub('.', '_') rescue ''

    # Puts the app in to a read-only mode without logins.
    config.minimal_mode = false

    config.assets.precompile += ['**/blockly_editor*']
  end
end
