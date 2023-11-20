require lib_dir 'cdo/data/logging/rake_task_event_logger'

require_relative '../../../../../lib/test/test_helper'
require 'rake'

include TimedTaskWithLogging

class RakeEventLoggerTest < ActiveSupport::TestCase
  def test_task_with_exception_while_running
    # 1) Verify that an exception was thrown by the task
    # 2) Verify that a start task event was executed (since it happened before exception)
    # 3) Verify that an exception was logged
    # 4) Verify that an end task event was not called because the exception disrupted the flow
    RakeTaskEventLogger.any_instance.expects(:start_task_logging).once
    RakeTaskEventLogger.any_instance.expects(:end_task_logging).never
    RakeTaskEventLogger.any_instance.expects(:exception_task_logging).once
    error = assert_raises(RuntimeError) do
      Rake::Task['test_exception_timed_task'].invoke
    end
    assert_equal 'This is really bad', error.message
  end

  def test_successful_task_with_no_exceptions
    # Verifiy that the start and the end of the task was successfully logged
    RakeTaskEventLogger.any_instance.expects(:start_task_logging).once
    RakeTaskEventLogger.any_instance.expects(:end_task_logging).once
    RakeTaskEventLogger.any_instance.expects(:exception_task_logging).never
    Rake::Task['test_successful_timed_task'].invoke
  end

  def test_logger_throwing_an_exception_on_healthy_task
    # 1) Verify that the task tried to log the beginning
    # 2) Verify that the task tried to log an end even when the logger failed
    # 3) Verify that an exception was not logged
    # 4) Make sure the task finishes without exceptions
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
