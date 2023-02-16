require 'action_view'
require 'rake/task'
module CustomRake
  class TimedTaskWithLogging < Rake::Task
    include ActionView::Helpers::DateHelper

    def execute(args = nil)
      ChatClient.log "Executing", color: 'green'
      logger = RakeTaskEventLogger.new(self)
      logger.start_task_logging
      begin
        RakeTaskEventLogger.increase_depth
        task_execution = super
        RakeTaskEventLogger.decrease_depth
        puts "Finished #{name} (#{distance_of_time_in_words(Benchmark.realtime {task_execution}.to_f)})"
      rescue => exception
        RakeTaskEventLogger.decrease_depth
        logger.exception_task_logging(exception)
        raise
      end
      logger.end_task_logging
    end
  end
end

module TimedTaskWithLogging
  def timed_task_with_logging(*args, &block)
    CustomRake::TimedTaskWithLogging.define_task(*args, &block)
  end
end
