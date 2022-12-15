require lib_dir 'cdo/data/logging/rake_task_event_logger'

require_relative '../../../../../lib/test/test_helper'
require 'rake'

include TimedTaskWithLogging

class RakeEventLoggerTest < ActiveSupport::TestCase
  def test_failed_task
    RakeTaskEventLogger.any_instance.expects(:start_task_logging).once
    RakeTaskEventLogger.any_instance.expects(:end_task_logging).never
    RakeTaskEventLogger.any_instance.expects(:exception_task_logging).once
    error = assert_raises(RuntimeError) do
      Rake::Task['test_exception_timed_task'].invoke
    end
    assert_equal 'This is really bad', error.message
  end

  def test_successful_task
    RakeTaskEventLogger.any_instance.expects(:start_task_logging).once
    RakeTaskEventLogger.any_instance.expects(:end_task_logging).once
    RakeTaskEventLogger.any_instance.expects(:exception_task_logging).never
    Rake::Task['test_successful_timed_task'].invoke
  end

  def test_failed_logger_task
    RakeTaskEventLogger.any_instance.expects(:start_task_logging).once
    RakeTaskEventLogger.any_instance.expects(:end_task_logging).once
    RakeTaskEventLogger.any_instance.expects(:exception_task_logging).never
    RakeTaskEventLogger.any_instance.stubs(:log_event).raises(RuntimeError, "failed logger")
    Rake::Task['test_failed_logger_timed_task'].invoke
    RakeTaskEventLogger.any_instance.unstub(:start_task_logging)
  end

  timed_task_with_logging :test_failed_logger_timed_task do
    puts "This will have a bad logger"
  end

  timed_task_with_logging :test_successful_timed_task do
    puts "This is a successful task"
  end

  timed_task_with_logging :test_exception_timed_task do
    raise 'This is really bad'
  end
end
