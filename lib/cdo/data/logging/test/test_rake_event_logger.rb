require lib_dir 'cdo/data/logging/rake_task_event_logger'

require_relative '../../../../../lib/test/test_helper'
require 'rake'

include TimedTaskWithLogging

class RakeEventLoggerTest < ActiveSupport::TestCase
  def test_failed_task
    error = assert_raises(RuntimeError) do
      Rake::Task['test_task'].invoke
    end
    assert_equal 'This is really bad', error.message
    RakeTaskEventLogger.any_instance.expects(:exception_task_logging).once.with
    RakeTaskEventLogger.any_instance.expects(:start_task_logging).once.with
  end

  timed_task_with_logging :test_task do
    raise 'This is really bad'
  end
end
