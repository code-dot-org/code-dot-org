# Because loading YAML locales is super-slow, only load english yml locale files in development
# To load all locales for testing, add "load_locales: true" to locals.yml config
if Rails.env.development? && (!CDO.load_locales)
  locale_paths = Dashboard::Application.paths['config/locales'].expanded.select{|x| x.include?('en')}
  Dashboard::Application.config.i18n.railties_load_path = locale_paths
end

# Preload translations (before application fork, after i18n_railtie initializer)
# Skip if this is running a Rake task (e.g. rake db:setup or rake test)
if  File.basename($0) == 'rake' || ENV['FAST_START']
  Rails.logger.info 'Skipping translations preload'
else
  Rails.logger.info 'Preloading translations'
  Dashboard::Application.config.after_initialize do |_|
    I18n.backend.init_translations if I18n.backend.respond_to? :init_translations
    I18n.t 'hello'
  end
end
