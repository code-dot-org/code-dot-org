# LogCollector is a simple container that collects log messages and exceptions
# when executing a task. It can also time block execution and log the result.
#
# LogCollector is helpful when we want to
# - Prevent non-fatal errors from stopping process execution but still want to know about them.
# - Bubble up combined errors and info from lower levels to higher levels, or to external components
#   such as HoneyBadger and Slack.
#
class LogCollector
  attr_reader :exceptions, :logs, :metrics, :task_name

  # @param task_name [String] friendly name of the task to collect logs for
  # @param print_log_immediately [Boolean] print a log as soon as it is added to the log collector
  def initialize(task_name = nil, print_log_immediately = true)
    @task_name = task_name
    @exceptions = []  # rescued exceptions
    @logs = []
    @metrics = {}
    @print_log_immediately = print_log_immediately
  end

  # Execute a block and time it.
  # Save exception if caught, do not re-raise. Caller's flow will continue as normal.
  #
  # @param action_name [string] a friendly name of the block being executed
  def time(action_name = '')
    return unless block_given?
    info("Starting action '#{action_name}'...")
    start_time = Time.now
    yield
    info(
      "Action '#{action_name}' completed without error in"\
      " #{self.class.get_friendly_time(Time.now - start_time)}."
    )
  rescue StandardError => e
    error(
      "Action '#{action_name}' exited with error in"\
      " #{self.class.get_friendly_time(Time.now - start_time)}."
    )
    record_exception(e)
  end
  alias_method :time_and_continue, :time

  # Execute a block and time it.
  # Re-raise exception if caught, do not save. This will disrupt the caller's flow.
  #
  # @param action_name [string] friendly name for the given block
  # @raise [StandardError] error encountered when executing the given block
  def time!(action_name = '')
    return unless block_given?
    info("Starting action '#{action_name}'...")
    start_time = Time.now
    yield
    info(
      "Action '#{action_name}' completed without error in"\
      " #{self.class.get_friendly_time(Time.now - start_time)}."
    )
  rescue StandardError
    error(
      "Action '#{action_name}' exited with error in"\
      " #{self.class.get_friendly_time(Time.now - start_time)}. Exception re-raised!"
    )
    # To be handled by caller
    raise
  end
  alias_method :time_and_raise!, :time!

  def info(message)
    logs << "[#{Time.now}] INFO: #{message}"
    CDO.log.info logs.last if @print_log_immediately
  end

  def error(message)
    logs << "[#{Time.now}] ERROR: #{message}"
    CDO.log.error logs.last if @print_log_immediately
  end

  def record_exception(e)
    exceptions << e
    error("Exception caught: #{e.inspect}. Stack trace:\n#{e.backtrace.join("\n")}")
  end

  # @param metrics [Hash]
  # @return [Hash]
  def record_metrics(metrics)
    @metrics.merge! metrics
  end

  def ok?
    exceptions.blank?
  end

  def to_s
    exception_count = exceptions.length
    log_count = logs.length
    metric_count = metrics.length
    summary = "Task '#{task_name}' recorded "\
      "#{exception_count} #{'exception'.pluralize(exception_count)}, "\
      "#{log_count} #{'log message'.pluralize(log_count)}, "\
      "and #{metric_count} #{'metric'.pluralize(metric_count)}."

    # Return a summary and a detailed list of exceptions, logs and metrics.
    [
      summary,
      "#{exception_count} #{'exception'.pluralize(exception_count)}:",
      exceptions.map(&:message),
      "#{log_count} #{'log message'.pluralize(log_count)}:",
      logs,
      "#{metric_count} #{'metric'.pluralize(metric_count)}:",
      metrics
    ].flatten.join("\n")
  end
  alias_method :inspect, :to_s

  def self.get_friendly_time(value)
    "#{value.round(2)} seconds" if value.respond_to?(:round)
  end
end
