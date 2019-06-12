class LogObject
  attr_reader :errors, :logs

  def initialize
    @errors = []  # List of rescued error objects
    @logs = []    # List of message logs
  end

  # Execute a block and time it.
  # Save exception if caught, do not re-raise. Caller's flow will continue as normal.
  #
  # @param action_name [string] a friendly name of the block being executed
  def time(action_name = nil)
    start_time = Time.now
    return unless block_given?

    yield

    info("#{action_name || 'Unnamed'} action completed without error in"\
      " #{Time.now - start_time} seconds."
    )
  rescue StandardError => e
    error("#{action_name || 'Unnamed'} action exited with error in"\
      " #{Time.now - start_time} seconds."
    )
    record_exception(e)
  end

  # Execute a block and time it.
  # Re-raise execption if caught, do not save. This will disrupt the caller's flow.
  #
  # @param action_name [string] friendly name for the given block
  #
  # @raise [StandardError] error encoutered when executing the given block
  def time!(action_name = nil)
    start_time = Time.now
    return unless block_given?

    yield

    info("#{action_name || 'Unnamed'} action completed without error in"\
      " #{Time.now - start_time} seconds."
    )
  rescue StandardError => e
    error("#{action_name || 'Unnamed'} action exited with error in"\
      " #{Time.now - start_time} seconds. Exception re-raised!"
    )

    # To be handle by caller
    raise e
  end

  def info(message)
    logs << "[#{Time.now}]  INFO: #{message}"
  end

  def error(message)
    logs << "[#{Time.now}] ERROR: #{message}"
  end

  def record_exception(e)
    errors << e
    error("Exception caught: #{e.inspect}.")
  end

  def ok?
    errors.blank?
  end

  def to_s
    str = "Recorded #{errors.size} errors and #{logs.size} log messages."
    logs.each {|log| str.concat("\n#{log}")}
    str
  end

  alias_method :inspect, :to_s
end
