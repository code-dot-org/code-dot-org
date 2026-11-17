require_relative '../../../test_helper'
require 'rake'
require 'timecop'
require 'cdo/data/logging/timed_task_with_logging'

# #execute reports to RakeTaskEventLogger, which writes to CloudWatch and
# Firehose. The wrapper does not require it, so a stand-in suffices. The
# real one blocks on CloudWatch; `delay` stands in for that.
class RakeTaskEventLogger
  class << self
    attr_accessor :delay
  end

  def self.increase_depth
  end

  def self.decrease_depth
  end

  def initialize(_task)
    # Object#initialize rejects the task argument.
  end

  def start_task_logging
    Timecop.travel(self.class.delay) if self.class.delay
  end

  def end_task_logging
  end

  def exception_task_logging(_exception)
  end
end

class TimedTaskWithLoggingTest < Minitest::Test
  # Benchmark.realtime reads the monotonic clock, so a task block that
  # travels this far registers as having taken this long, with no sleeping.
  TRAVEL_TIME = 61

  def setup
    Timecop.mock_process_clock = true
    @previous_application = Rake.application
    Rake.application = Rake::Application.new
    @child = CustomRake::TimedTaskWithLogging.define_task(:child) {Timecop.travel(TRAVEL_TIME)}
    @parent = CustomRake::TimedTaskWithLogging.define_task(parent: :child) {}
  end

  def teardown
    Rake.application = @previous_application
    RakeTaskEventLogger.delay = nil
    Timecop.return
    Timecop.mock_process_clock = false
  end

  def test_duration_words
    {
      0.4 => '<1s',
      0.9 => '<1s',
      22 => '22s',
      95.4 => '1m35s',
      3605 => '1h5s',
    }.each do |seconds, words|
      assert_equal words, @child.send(:duration_words, seconds)
    end
  end

  def test_timing_words
    assert_equal 'in 4m11s total (3m11s excluding prerequisites)', @child.send(:timing_words, 251, 191)
    assert_equal 'in 22s', @child.send(:timing_words, 22.4, 22.1)
    assert_equal 'in 5s', @child.send(:timing_words, 5, nil)
  end

  def test_leaf_prints_one_number_after_it_runs
    out, _err = capture_io {@child.invoke}
    assert_equal ['Finished child in 1m1s'], out.lines(chomp: true)
  end

  def test_parent_line_shows_time_spent_in_prerequisites
    out, _err = capture_io {@parent.invoke}
    assert_equal [
      'Finished child in 1m1s',
      'Finished parent in 1m1s total (<1s excluding prerequisites)',
    ], out.lines(chomp: true)
  end

  def test_event_logging_counts_as_own_time
    RakeTaskEventLogger.delay = TRAVEL_TIME
    leaf = CustomRake::TimedTaskWithLogging.define_task(:leaf) {}
    out, _err = capture_io {leaf.invoke}
    assert_equal ['Finished leaf in 1m1s'], out.lines(chomp: true)
  end

  def test_plain_task_can_invoke_a_timed_prerequisite
    plain = Rake::Task.define_task(plain: :child) {}
    out, _err = capture_io {plain.invoke}
    assert_equal ['Finished child in 1m1s'], out.lines(chomp: true)
  end

  def test_timed_task_can_invoke_a_plain_prerequisite
    Rake::Task.define_task(:plain) {Timecop.travel(TRAVEL_TIME)}
    timed = CustomRake::TimedTaskWithLogging.define_task(timed: :plain) {}
    out, _err = capture_io {timed.invoke}
    assert_equal ['Finished timed in 1m1s total (<1s excluding prerequisites)'], out.lines(chomp: true)
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
