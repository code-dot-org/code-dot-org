# This rake task was added by annotate_rb gem.

if Rails.env.development? || ENV['CI']
  begin
    require "annotate_rb"

    AnnotateRb::Core.load_rake_tasks
  rescue LoadError
    # Production-gem images (docker/migrate) boot development without the
    # development gem group; annotation tasks just go missing there.
  end
end
