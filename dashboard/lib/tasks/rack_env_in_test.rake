require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

namespace :test do
  timed_task_with_logging :prepare do
    ENV['RACK_ENV'] = 'test' # we need to set rack env before deployment.rb loads
  end
end
