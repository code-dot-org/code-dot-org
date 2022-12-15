require lib_dir 'cdo/data/logging/timed_task_with_logging'
class RakeTaskEventLogger
  STUDY_TABLE = 'rake_performance'.freeze
  CURRENT_LOGGING_VERSION = 'v0'.freeze

  def initialize(rake_task)
    @start_time = 0
    @end_time = 0
    @rake_task = rake_task
    @enabled = !([:development, :test].include?(rack_env))
  end

  def start_task_logging
    @start_time = Time.new
    event = 'start'.freeze
    log_event(event)
  end

  def exception_task_logging(exception)
    @end_time = Time.new
    duration = @end_time.to_i - @start_time.to_i
    event = 'exception'.freeze
    log_event(event, duration, exception)
  end

  def end_task_logging
    @end_time = Time.new
    duration = @end_time.to_i - @start_time.to_i
    event = 'end'.freeze
    log_event(event, duration)
  end

  def task_chain
    pre_requisites_split = @rake_task.inspect.split('=>')
    unless pre_requisites_split.empty?
      return pre_requisites_split[1]
    end
    return nil
  end

  def log_event(event, duration = nil, exception = nil)
    if @enabled == false
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
            duration: duration,
            exception: exception&.to_s,
            exception_backtrace: exception&.backtrace,
            version: CURRENT_LOGGING_VERSION,
          }.to_json
        }
      )
    rescue => e
      Honeybadger.notify(
        e,
        error_message: "Failed to log rake task information",
        context: {
          event: event
        }
      )
    end
  end
end
