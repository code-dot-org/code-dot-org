require lib_dir 'cdo/data/logging/timed_task_with_logging'
require lib_dir 'cdo/data/logging/infrastructure_logger'
require 'cdo/git_utils'
class RakeTaskEventLogger
  STUDY_TABLE = 'rake_performance'.freeze
  CURRENT_LOGGING_VERSION = 'v1'.freeze
  @@depth = 0

  def initialize(rake_task)
    @start_time = 0
    @end_time = 0
    @rake_task = rake_task
    @enabled_firehose = !([:development, :test].include?(rack_env))
  end

  def self.depth
    @@depth
  end

  def self.increase_depth
    @@depth += 1
  end

  def self.decrease_depth
    @@depth -= 1
  end

  def start_task_logging
    @start_time = Time.new
    event = 'start'.freeze
    log_event(event)
  end

  def exception_task_logging(exception)
    @end_time = Time.new
    duration_ms = ((@end_time - @start_time).to_f * 1000).to_i
    event = 'exception'.freeze
    log_event(event, duration_ms, exception)
  end

  def end_task_logging
    @end_time = Time.new
    duration_ms = ((@end_time - @start_time).to_f * 1000).to_i
    event = 'end'.freeze
    log_event(event, duration_ms)
  end

  def task_chain
    @rake_task.prerequisites.join(', ')
  end

  def log_firehose(event, duration_ms, exception)
    if @enabled_firehose == false
      return
    end

    begin
      FirehoseClient.instance.put_record(
        :analysis,
        {
          study: STUDY_TABLE,
          event: event,
          data_json: {
            task_name: @rake_task.name,
            pid: Process.pid,
            invocation_chain: task_chain,
            duration_ms: duration_ms,
            exception: exception&.to_s,
            exception_backtrace: exception&.backtrace,
            version: CURRENT_LOGGING_VERSION,
          }.to_json
        }
      )
    rescue => exception
      Harness.error_notify(
        exception,
        error_message: "Failed to log rake task information in firehose",
        context: {
          event: event
        }
      )
    end
  end

  # Logging 3 metrics to track rake tasks performance
  # 1) Any task that has no dependencies (root task)
  # 2) Any task that is a leaf task (children, the processes to optimize)
  # 3) Any task
  def log_cloud_watch(event, duration_ms)
    metric_value = duration_ms.nil? ? 1 : duration_ms.to_i
    extra_dimensions = {task_name: @rake_task.name}
    total_dependencies = task_chain.split(',').count
    if @@depth == 0
      metric_name = "rake_tasks_root_task_#{event}"
      Infrastructure::Logger.put(metric_name, metric_value, extra_dimensions)
    end
    if total_dependencies == 0
      metric_name = "rake_tasks_no_dependencies_task_#{event}"
      Infrastructure::Logger.put(metric_name, metric_value, extra_dimensions)
    end
    metric_name = "rake_tasks_#{event}"
    Infrastructure::Logger.put(metric_name, metric_value, extra_dimensions)
    Infrastructure::Logger.flush
  end

  def log_event(event, duration = nil, exception = nil)
    log_firehose(event, duration, exception)
    log_cloud_watch(event, duration)
  end
end
