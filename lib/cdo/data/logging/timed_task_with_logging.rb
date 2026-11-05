require 'benchmark'
require 'rake/task'
# the dotiw gem depends on ActiveSupport core extensions it never requires, and
# patches distance_of_time_in_words only if ActionView::Helpers is already
# defined when it loads.
require 'active_support'
require 'active_support/core_ext'
require 'action_view'
require 'dotiw'

# Helper module for defining Rake tasks with timing and logging capabilities.
#
# timed_task_with_logging records both own time (spent inside the task's own
# block) and total time (including prerequisites). Tasks with substantial time
# spent in prerequisites log both total and own time, while other tasks log only
# a single time. This plays out as follows:
# - Leaf tasks and parents whose prereqs had already run show only one number.
# - The first task to reach a prerequisite will include its time in the total.
#   This includes :environment, which includes the Rails boot time.
# - When a parent task invokes a child task directly within its own #execute
#   block, the child's time counts toward the parent's own time.

module CustomRake
  class TimedTaskWithLogging < Rake::Task
    include ActionView::Helpers::DateHelper

    # Rake runs prerequisites and calls #execute from within this method. This
    # wrapper measures total time, and logs both total time and own time.
    def invoke_with_call_chain(task_args, invocation_chain)
      return super if already_invoked
      @own_seconds = nil
      total_seconds = Benchmark.realtime {super}
      puts "Finished #{name} #{timing_words(total_seconds, @own_seconds)}"
    end

    # Rake calls #execute to run the task's own block. This wrapper logs the
    # time spent in the block in two ways: by logging it to CloudWatch, and by
    # measuring it directly for local logging.
    def execute(args = nil)
      @own_seconds = Benchmark.realtime do
        logger = RakeTaskEventLogger.new(self)
        logger.start_task_logging
        begin
          RakeTaskEventLogger.increase_depth
          super
          RakeTaskEventLogger.decrease_depth
        rescue => exception
          RakeTaskEventLogger.decrease_depth
          logger.exception_task_logging(exception)
          raise
        end
        logger.end_task_logging
      end
    end

    # Converts a duration in seconds for each input to a human-readable string.
    # Prints one value if they appear the same, or both values if they differ.
    private def timing_words(total_seconds, own_seconds)
      total = duration_words(total_seconds)
      own = duration_words(own_seconds || total_seconds)
      return "in #{total}" if own == total
      "in #{total} total (#{own} excluding prerequisites)"
    end

    # "1 minute and 35 seconds", "5 seconds" or "less than a second".
    private def duration_words(seconds)
      distance_of_time_in_words(seconds, 0, include_seconds: true)
    end
  end
end

module TimedTaskWithLogging
  def timed_task_with_logging(...)
    CustomRake::TimedTaskWithLogging.define_task(...)
  end
end
