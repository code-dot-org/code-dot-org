class LogObject
  def initialize
    @errors = []
    @logs = []
  end

  def time(action_name = nil)
    start_time = Time.now
    yield if block_given?
    info("#{action_name || 'Unnamed'} action completed in #{Time.now - start_time} seconds.")
  rescue => e
    # @note this catchs all standard errors and exception
    error("#{action_name || 'Unnamed'} action exited with error "\
      "in #{Time.now - start_time} seconds.\n"\
      "Error = #{e.inspect}."
    )
  end

  def to_s
    str = "Recorded #{@errors.size} error messages and #{@logs.size} log messages."
    @errors.each {|error| str.concat("\n#{error}")}
    @logs.each {|log| str.concat("\n#{log}")}
    str
  end

  def info(message)
    @logs << "[#{Time.now}]  INFO: #{message}"
  end

  def error(message)
    @errors << "[#{Time.now}] ERROR: #{message}"
  end

  alias_method :inspect, :to_s
end
