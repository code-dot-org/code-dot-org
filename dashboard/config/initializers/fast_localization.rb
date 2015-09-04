# Because loading YAML locales is super-slow, only load english yml locale files in development
# To load all locales for testing, add "load_locales: true" to locals.yml config
if Rails.env.development? && (!CDO.load_locales)
  locale_paths = Dashboard::Application.paths['config/locales'].expanded.select{|x| x.include?('en')}
  Dashboard::Application.config.i18n.railties_load_path = locale_paths
end

# Preload translations (before application fork, after i18n_railtie initializer)
Dashboard::Application.config.after_initialize do |_|
  I18n.backend.init_translations if I18n.backend.respond_to? :init_translations
  I18n.t 'hello'
end
