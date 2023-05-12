require 'action_view'
require 'rake/task'
module CustomRake
  class TimedTaskWithLogging < Rake::Task
    include ActionView::Helpers::DateHelper

    def execute(args = nil)
      logger = RakeTaskEventLogger.new(self)

      RakeTaskEventLogger.add_task_node(self)
      RakeTaskEventLogger.increase_depth
      logger.start_task_logging
      begin
        puts "Finished #{name} (#{distance_of_time_in_words(Benchmark.realtime {super}.to_f)})"
        logger.end_task_logging
        RakeTaskEventLogger.decrease_depth
        RakeTaskEventLogger.remove_task_node
      rescue => exception
        logger.exception_task_logging(exception)
        RakeTaskEventLogger.decrease_depth
        RakeTaskEventLogger.remove_task_node
        raise
      end
    end
  end
end

module TimedTaskWithLogging
  def timed_task_with_logging(*args, &block)
    CustomRake::TimedTaskWithLogging.define_task(*args, &block)
  end
end
