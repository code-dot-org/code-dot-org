require 'action_view'
require 'rake/task'
module CustomRake
  class TimedTaskWithLogging < Rake::Task
    def get_indent_level
      ENV['TIMED_TASK_WITH_LOGGING_INDENT_LEVEL'] ||= '0'
      ENV['TIMED_TASK_WITH_LOGGING_INDENT_LEVEL'].to_i
    end

    def increment_indent_level
      set_indent_level(get_indent_level + 1)
    end

    def decrement_indent_level
      set_indent_level([get_indent_level - 1, 0].max)
    end

    def set_indent_level(level)
      ENV['TIMED_TASK_WITH_LOGGING_INDENT_LEVEL'] = level.to_s
      level.to_i
    end

    include ActionView::Helpers::DateHelper

    def execute(args = nil)
      logger = RakeTaskEventLogger.new(self)
      logger.start_task_logging
      begin
        increment_indent_level
        RakeTaskEventLogger.increase_depth
        indent = '  ' * get_indent_level
        puts "#{indent}Starting #{name}"
        puts "#{indent}Finished #{name} (#{distance_of_time_in_words(Benchmark.realtime {super}.to_f)})"
        RakeTaskEventLogger.decrease_depth
      rescue => exception
        RakeTaskEventLogger.decrease_depth
        logger.exception_task_logging(exception)
        raise
      ensure
        decrement_indent_level
      end
      logger.end_task_logging
    end
  end
end

module TimedTaskWithLogging
  def timed_task_with_logging(...)
    CustomRake::TimedTaskWithLogging.define_task(...)
  end
end
