# Run 'rake' or 'rake -D' to get a list of valid Rake commands with descriptions.

Rake::TaskManager.record_task_metadata = true
Dir.glob(File.join(__dir__, 'lib/rake/*.rake')).each{|rake| import rake}

task :default do
  # Output a list of tasks without performance hit shelling out to `rake -T`.
  # Ref: http://stackoverflow.com/a/11320444/2518355
  Rake.application.options.show_tasks = :tasks
  Rake.application.options.show_task_pattern = //
  Rake.application.display_tasks_and_comments
end
