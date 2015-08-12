# Because loading YAML locales is super-slow, only load english yml locale files in development
# To load all locales for testing, add "load_locales: true" to locals.yml config
if Rails.env.development? && (!CDO.load_locales)
  locale_paths = Dashboard::Application.paths['config/locales'].expanded.select{|x| x.include?('en')}
  Dashboard::Application.config.i18n.railties_load_path = locale_paths
end
I18n.t 'hello'
