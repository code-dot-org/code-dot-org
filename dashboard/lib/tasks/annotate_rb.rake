# This rake task was added by annotate_rb gem.

if Rails.env.development? || ENV['CI']
  require "annotate_rb"

  AnnotateRb::Core.load_rake_tasks
end
