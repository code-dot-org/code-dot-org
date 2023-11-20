ENV['RACK_ENV'] = 'test'

ENV['HONEYBADGER_LOGGING_LEVEL'] = 'error'

require 'rake/testtask'
require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

Rake::TestTask.new.tap {|x| x.warning = false}

namespace :test do
  desc 'Reset test dependencies: Drop, re-create and re-seed the database'
  timed_task_with_logging reset_dependencies: ['db:recreate', 'seed:reset']
end
