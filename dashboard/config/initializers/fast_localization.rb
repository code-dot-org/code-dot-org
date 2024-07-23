# Because loading YAML locales is super-slow, only load english yml locale files in development
# To load all locales for testing, add "load_locales: true" to locals.yml config

if (CDO.skip_locales || Rails.env.development?) && (!CDO.load_locales)
  Dashboard::Application.config.i18n.railties_load_path.each do |path|
    path.glob = "*{es-ES,en}.yml"
  end
end

# Preload translations (before application fork, after i18n_railtie initializer)
Dashboard::Application.config.after_initialize do |_|
  unless ENV['SKIP_I18N_INIT']
    I18n.backend.init_translations if I18n.backend.respond_to? :init_translations
    I18n.t 'hello'
  end
end

# Patch the I18n FileUpdateChecker to only load changed i18n files when updated.
Dashboard::Application.config.after_initialize do |app|
  app.reloaders.each do |reloader|
    if reloader.is_a?(ActiveSupport::FileUpdateChecker) && reloader.files == I18n.load_path
      reloader.block = ->(files) {I18n.backend.load_translations(files)}
    end
  end
end

module UpdateCheckerExt
  # Expose @block and @files variables.
  attr_accessor :block, :files

  # Pass list of updated files as a block parameter.
  def execute
    @last_watched = watched
    @last_updated = @last_watched.reject {|path| File.mtime(path) < @last_update_at}
    @last_update_at = updated_at(@last_watched)
    @block.arity == 1 ? @block.call(@last_updated) : @block.call
  ensure
    @watched = nil
    @updated_at = nil
  end
end

Rails.application.config.to_prepare do
  ActiveSupport::FileUpdateChecker.prepend UpdateCheckerExt
end
