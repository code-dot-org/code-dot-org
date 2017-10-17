# Preload translations (before application fork, after i18n_railtie initializer)
Dashboard::Application.config.after_initialize do |_|
  unless ENV['SKIP_I18N_INIT']
    I18n.t 'cancel' # i18n key found in dashboard (and not pegasus) locale
  end
end

# Patch the I18n FileUpdateChecker to only load changed i18n files when updated.
Dashboard::Application.config.after_initialize do |app|
  app.reloaders.each do |reloader|
    if reloader.is_a?(ActiveSupport::FileUpdateChecker) && reloader.files == I18n.load_path
      reloader.block = lambda {|files| I18n.backend.load_translations(files)}
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

ActiveSupport::FileUpdateChecker.prepend UpdateCheckerExt
