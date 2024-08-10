class JobWithResults < ApplicationJob
  after_enqueue :write_enqueue_time
  before_perform :write_start_time
  after_perform :write_end_time
  around_perform :timeout

  rescue_from(StandardError) do |exception|
    write_exception(exception)
  end

  # Default timeout is 60s, set this in your class to override.
  @@timeout_s ||= 60

  # Gets the results of the job, if there's no results it polls and waits for them
  def wait_for_results(timeout_s: @@timeout_s, poll_interval_s: 1)
    start_time = Time.now

    until Time.now - start_time > timeout_s
      val = results
      return val if val

      sleep(poll_interval_s)
    end
    nil # timed out
  end

  # Non-blocking version of wait_for_results()
  def results
    exception = read(:exception)
    raise deserialize_exception(exception) if exception

    read(:results) # nil if no results yet
  end

  def cache
    Cdo::SharedCache.cache
  end

  def key(type)
    "jobs/#{self.class.name}/#{job_id}/#{type}"
  end

  def write(key_type, obj)
    cache.write(key(key_type), obj)
  end

  def read(key_type)
    cache.read(key(key_type))
  end

  def write_results(results)
    write(:results, results)
  end

  def write_exception(exception)
    write(:exception, serialize_exception(exception))
  end

  def write_enqueue_time
    write(:enqueue_time, Time.now)
  end

  def write_start_time
    write(:start_time, Time.now)
  end

  def write_end_time
    write(:end_time, Time.now)
  end

  def timeout(&block)
    Timeout.timeout(@@timeout_s, &block)
  end

  private def serialize_exception(exception)
    {
      class: exception.class.name,
      message: exception.message,
      backtrace: exception.backtrace,
    }
  end

  private def deserialize_exception(serialized_exception)
    begin
      # Try to instantiate the same exception class
      exception_class = Object.const_get(serialized_exception[:class])
      exception = exception_class.new(serialized_exception[:message])
    rescue
      # If you can't, no biggie, just use a StandardError with the class added to the message
      exception = StandardError.new("#{serialized_exception[:message]} (#{serialized_exception[:class]})")
    end
    exception.set_backtrace(serialized_exception[:backtrace])
    exception
  end
end
