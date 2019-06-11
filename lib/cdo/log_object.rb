class LogObject
  def initialize
    @errors = []  # List of rescued error objects
    @logs = []    # List of message logs
  end

  # Save exception if caught, do not re-raise. Continue with the caller flow.
  def time(action_name = nil)
    start_time = Time.now
    yield if block_given?
    info("#{action_name || 'Unnamed'} action completed without error in #{Time.now - start_time} seconds.")
  rescue StandardError => e
    error("#{action_name || 'Unnamed'} action exited with error "\
      "in #{Time.now - start_time} seconds.\n"\
      "Error = #{e.inspect}."
    )

    @errors << e
  end

  # Re-raise execption if caught. Disrupt the caller flow.
  def time!(action_name = nil)
    start_time = Time.now
    yield if block_given?
    info("#{action_name || 'Unnamed'} action completed  without error in #{Time.now - start_time} seconds.")
  rescue StandardError => e
    error("#{action_name || 'Unnamed'} action exited with error "\
      "in #{Time.now - start_time} seconds.\n"\
      "Error = #{e.inspect}."
    )

    # To be handle by caller
    raise e
  end

  def to_s
    str = "Recorded #{@errors.size} errors and #{@logs.size} log messages."
    @logs.each {|log| str.concat("\n#{log}")}
    # @errors.each {|error| str.concat("\n#{error}")}
    # str.concat(error_str)
    str
  end

  alias_method :inspect, :to_s

  def info(message)
    @logs << "[#{Time.now}]  INFO: #{message}"
  end

  def error(message)
    @logs << "[#{Time.now}] ERROR: #{message}"
  end

  def record_exception(e)
    @errors << e
    error("Caught exception #{e.inspect}")
  end

  def ok?
    @errors.blank?
  end

  def error_count
    @errors.size
  end

  def error_str
    return '' if @errors.blank?

    @errors.map(&:inspect).join('\n')
  end
end
