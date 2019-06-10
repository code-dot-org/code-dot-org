class LogObject
  def initialize
    @errors = []
    @logs = []
  end

  def time(message = nil)
    start_time = Time.now
    yield if block_given?
    info("#{message || 'Unnamed'} action completed in #{Time.now - start_time} seconds")
  rescue => e
    # TODO: this catchs all standard errors and exception
    @errors << e
    error("#{message || 'Unnamed'} action exited with error(s) in #{Time.now - start_time} seconds")
  end

  def to_s
    str = "#{@errors.size} error massages and #{@logs.size} log messages."
    # TODO: print error messages (not stack traces)
    @errors.each {|error| str.concat("\n#{error.message}")}
    @logs.each {|log| str.concat("\n#{log}")}
    str
  end

  def info(message)
    @logs << "[#{Time.now}]  INFO: #{message}"
  end

  def error(message)
    @logs << "[#{Time.now}] ERROR: #{message}"
  end

  alias_method :inspect, :to_s
end
