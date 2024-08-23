require 'rake/testtask'
require 'cdo/rake_utils'
require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

timed_task_with_logging test: [:prepare_dbs] do
  ENV['RACK_ENV'] = 'test' if rack_env?(:development)
  Rake::TestTask.new.tap do |t|
    t.warning = false
    t.pattern = 'test/**/test*.rb'
  end
end
