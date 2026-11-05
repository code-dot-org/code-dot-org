require_relative '../../../test_helper'
require 'rake'
require 'cdo/data/logging/timed_task_with_logging'

# #execute reports to RakeTaskEventLogger, which writes to CloudWatch and
# Firehose. The wrapper does not require it, so a silent stand-in suffices.
class RakeTaskEventLogger
  def self.increase_depth
  end

  def self.decrease_depth
  end

  def initialize(_task)
    # Object#initialize rejects the task argument, so this stays.
  end

  def start_task_logging
  end

  def end_task_logging
  end

  def exception_task_logging(_exception)
  end
end

class TimedTaskWithLoggingTest < Minitest::Test
  def setup
    @previous_application = Rake.application
    Rake.application = Rake::Application.new
    @child = CustomRake::TimedTaskWithLogging.define_task(:child) {sleep 0.05}
    @parent = CustomRake::TimedTaskWithLogging.define_task(parent: :child) {}
  end

  def teardown
    Rake.application = @previous_application
  end

  # Task names from "Finished <name> (<time>)" lines, in print order.
  def finished_tasks(out)
    out.lines(chomp: true).map {|line| line[/\AFinished (\S+) \(.+\)\z/, 1]}
  end

  def test_prints_one_line_per_task_after_it_runs
    out, _err = capture_io {@parent.invoke}
    assert_equal ['child', 'parent'], finished_tasks(out)
  end

  def test_plain_task_can_invoke_a_timed_prerequisite
    plain = Rake::Task.define_task(plain: :child) {}
    out, _err = capture_io {plain.invoke}
    assert_equal ['child'], finished_tasks(out)
  end

  def test_timed_task_can_invoke_a_plain_prerequisite
    Rake::Task.define_task(:plain) {}
    timed = CustomRake::TimedTaskWithLogging.define_task(timed: :plain) {}
    out, _err = capture_io {timed.invoke}
    assert_equal ['timed'], finished_tasks(out)
  end

  def test_second_invoke_prints_nothing
    capture_io {@parent.invoke}
    out, _err = capture_io {@parent.invoke}
    assert_empty out
  end

  def test_failure_prints_nothing
    failing = CustomRake::TimedTaskWithLogging.define_task(:failing) {raise 'boom'}
    out, _err = capture_io do
      assert_raises(RuntimeError) {failing.invoke}
    end
    assert_empty out
  end
end
