require lib_dir 'cdo/data/logging/timed_task_with_logging'
class RakeTaskEventLogger
  STUDY_TABLE = 'RAKE_TASKS'.freeze
  CURRENT_LOGGING_VERSION = 'v1'.freeze
  @@depth = 0
  def initialize(rake_task)
    @start_time = 0
    @end_time = 0
    @rake_task = rake_task
    @enabled_firehose = !([:development, :test].include?(rack_env))
    @enable_cloudwatch = true
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
    #pre_requisites_split = @rake_task.inspect.split('=>')
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
            arguments: @rake_task.arg_names,
            pid: Process.pid,
            invocation_chain: task_chain,
            duration_ms: duration_ms,
            exception: exception&.to_s,
            exception_backtrace: exception&.backtrace,
            version: CURRENT_LOGGING_VERSION,
          }.to_json
        }
      )
    rescue => e
      Honeybadger.notify(
        e,
        error_message: "Failed to log rake task information in firehose",
        context: {
          event: event
        }
      )
    end
  end

  def log_cloud_watch(event, duration_ms, exception = nil)
    unless @enable_cloudwatch
      return
    end

    puts "about to log metric"
    ChatClient.log "about to start logging", color: 'green'
    begin
      metrics = {
        metric_name: event,
        value: duration_ms.nil? ? 1 : duration_ms,
        dimensions: {name: "Environment",
                     environment: rack_env,
                     task_name: @rake_task.name,
                     # file_name: __FILE__,
                     # pid: Process.pid,
                     # invocation_chain: task_chain,
                     # exception: exception&.to_s,
                     # exception_backtrace: exception&.backtrace,
                     version: CURRENT_LOGGING_VERSION}
      }
      Cdo::Metrics.push(STUDY_TABLE, metrics)
      Cdo::Metrics.flush!
      ChatClient.log 'Metrics logged', color: 'green'
      ChatClient.log event, color: 'green'
      ChatClient.log @rake_task.name, color: 'green'
      ChatClient.log (duration_ms.nil? ? 1 : duration_ms), color: 'green'
      ChatClient.log __FILE__, color: 'green'
      ChatClient.log rack_env, color: 'green'
      ChatClient.log task_chain

      puts "Metrics logged"
      puts event

      puts duration_ms.nil? ? 1 : duration_ms
    rescue => e
      ChatClient.log 'Exception', color: 'green'
      ChatClient.log exception&.to_s, color: 'green'
      puts "Exception"
      puts e
      Honeybadger.notify(
        e,
        error_message: "Failed to log rake task information in cloudwatch",
        context: {
          event: event
        }
      )
    end
  end

  def log_event(event, duration = nil, exception = nil)
    log_firehose(event, duration, exception)
    log_cloud_watch(event, duration, exception)
  end
end
