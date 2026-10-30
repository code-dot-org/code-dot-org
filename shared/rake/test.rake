require 'rake/testtask'
require 'cdo/rake_utils'
require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

timed_task_with_logging :prepare_dbs do
  Dir.chdir(pegasus_dir) do
    puts "Migrating #{CDO.pegasus_db_name} database..."
    RakeUtils.rake_stream_output(
      'db:ensure_created',
      'db:migrate',
      env: {RAILS_ENV: 'test', RACK_ENV: 'test'}
    )
  end
end

timed_task_with_logging test: [:prepare_dbs] do
  ENV['RACK_ENV'] = 'test' if rack_env?(:development)
  ENV['HONEYBADGER_LOGGING_LEVEL'] = 'error'
  Rake::TestTask.new.tap do |t|
    t.warning = false
    t.pattern = 'test/**/test*.rb'
  end
end
