require 'benchmark'
require 'rake/task'
# dotiw 4.0.1 leans on ActiveSupport core extensions it never requires, and
# patches distance_of_time_in_words only if ActionView::Helpers is already
# defined when it loads, so both must come first. The dashboard gets this
# order from Rails; the root and pegasus rake processes get it here.
require 'active_support'
require 'active_support/core_ext'
require 'action_view'
require 'dotiw'
module CustomRake
  class TimedTaskWithLogging < Rake::Task
    include ActionView::Helpers::DateHelper

    # Rake runs prerequisites from here before calling #execute, so this
    # covers them; #execute alone covers only this task's own block. Public,
    # unlike rake's own: a plain task with a timed prerequisite calls this
    # from Rake::Task#invoke_prerequisites, and protected rejects that caller.
    def invoke_with_call_chain(task_args, invocation_chain)
      return super if already_invoked
      @own_seconds = nil
      total_seconds = Benchmark.realtime {super}
      puts "Finished #{name} #{timing_words(total_seconds, @own_seconds)}"
    end

    # The event logger blocks on CloudWatch twice per task. That is this
    # task's own cost, so the timing covers it rather than charging it to
    # the subtasks.
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

    # One number unless the prerequisites cost enough to show, which rules
    # out leaf tasks and parents whose prerequisites had already run. The
    # difference is time in prerequisites that first ran under this task;
    # :environment is one, so the first task to reach it carries the Rails
    # boot. A task the block invokes itself runs inside #execute and counts
    # as own time.
    private def timing_words(total_seconds, own_seconds)
      total = duration_words(total_seconds)
      own = duration_words(own_seconds || total_seconds)
      return "in #{total}" if own == total
      "in #{total} total (#{own} excluding prerequisites)"
    end

    # "1 minute and 35 seconds". Without include_seconds dotiw drops the
    # seconds once a duration reaches a minute.
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
