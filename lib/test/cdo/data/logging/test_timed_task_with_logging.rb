require_relative '../../../test_helper'
require 'rake'
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
    # Object#initialize rejects the task argument, so this stays.
  end

  def start_task_logging
    sleep(self.class.delay || 0)
  end

  def end_task_logging
  end

  def exception_task_logging(_exception)
  end
end

class TimedTaskWithLoggingTest < Minitest::Test
  SHORT_SLEEP = 0.05

  def setup
    @previous_application = Rake.application
    Rake.application = Rake::Application.new
    @child = CustomRake::TimedTaskWithLogging.define_task(:child) {sleep SHORT_SLEEP}
    @parent = CustomRake::TimedTaskWithLogging.define_task(parent: :child) {}
  end

  def teardown
    Rake.application = @previous_application
    RakeTaskEventLogger.delay = nil
  end

  # Saves test time: with the real formatter, a difference only shows at
  # whole seconds, so each test would have to sleep a full second to change
  # the printed line. Two coarse buckets let a short sleep do it instead.
  def stub_duration_words_for_short_sleep(*tasks)
    tasks.each do |task|
      task.define_singleton_method(:duration_words) {|seconds| seconds < SHORT_SLEEP / 2 ? 'none' : 'some'}
    end
  end

  def test_duration_words
    {
      0.4 => 'less than 1 second',
      0.9 => 'less than 1 second',
      22 => '22 seconds',
      95.4 => '1 minute and 35 seconds',
      3605 => '1 hour and 5 seconds',
    }.each do |seconds, words|
      assert_equal words, @child.send(:duration_words, seconds)
    end
  end

  def test_timing_words
    assert_equal 'in 4 minutes and 11 seconds total (3 minutes and 11 seconds excluding prerequisites)', @child.send(:timing_words, 251, 191)
    assert_equal 'in 22 seconds', @child.send(:timing_words, 22.4, 22.1)
    assert_equal 'in 5 seconds', @child.send(:timing_words, 5, nil)
  end

  def test_prints_one_line_per_task_after_it_runs
    out, _err = capture_io {@parent.invoke}
    assert_equal ['Finished child in less than 1 second', 'Finished parent in less than 1 second'], out.lines(chomp: true)
  end

  def test_parent_line_shows_time_spent_in_prerequisites
    stub_duration_words_for_short_sleep(@child, @parent)
    out, _err = capture_io {@parent.invoke}
    assert_equal ['Finished child in some', 'Finished parent in some total (none excluding prerequisites)'], out.lines(chomp: true)
  end

  def test_event_logging_counts_as_own_time
    RakeTaskEventLogger.delay = SHORT_SLEEP
    leaf = CustomRake::TimedTaskWithLogging.define_task(:leaf) {}
    stub_duration_words_for_short_sleep(leaf)
    out, _err = capture_io {leaf.invoke}
    assert_equal ['Finished leaf in some'], out.lines(chomp: true)
  end

  def test_plain_task_can_invoke_a_timed_prerequisite
    plain = Rake::Task.define_task(plain: :child) {}
    out, _err = capture_io {plain.invoke}
    assert_equal ['Finished child in less than 1 second'], out.lines(chomp: true)
  end

  def test_timed_task_can_invoke_a_plain_prerequisite
    Rake::Task.define_task(:plain) {sleep SHORT_SLEEP}
    timed = CustomRake::TimedTaskWithLogging.define_task(timed: :plain) {}
    stub_duration_words_for_short_sleep(timed)
    out, _err = capture_io {timed.invoke}
    assert_equal ['Finished timed in some total (none excluding prerequisites)'], out.lines(chomp: true)
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
