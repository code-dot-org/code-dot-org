class RakeTaskEventLogger
  STUDY_TABLE = 'rake_performance'.freeze
  CURRENT_LOGGING_VERSION = 'v0'.freeze
  def initialize
    @start_time = 0
    @end_time = 0
  end

  def start_task_logging
    @start_time = Time.new
    event = 'start'.freeze
    log_event(event)
  end

  def end_task_logging
    @end_time = Time.new
    duration = @end_time.to_i - @start_time.to_i
    event = 'end'.freeze
    log_event(event, duration)
  end

  def log_event(event, duration = nil)
    puts Rake::Task['test:reset_dependencies'].sources
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: STUDY_TABLE,
        event: event,
        data_json: {
          invocation_chain: Rake.application.top_level_tasks,
          pid: Process.pid,
          version: CURRENT_LOGGING_VERSION,
          duration: duration
        }.to_json
      }
    )
  end
end
