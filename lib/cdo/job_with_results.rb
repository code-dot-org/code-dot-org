class JobWithResults < ApplicationJob
  after_enqueue :write_enqueue_time
  before_perform :write_start_time
  after_perform :write_end_time
  around_perform :timeout

  # Default timeout is 60s, set this in your class to override.
  @@timeout_s ||= 60

  def wait_for_results(timeout_s: @@timeout_s, poll_interval_s: 1)
    start_time = Time.now
    until (result = cache.read(results_key)) || (Time.now - start_time > timeout_s)
      sleep(poll_interval_s)
    end
    result # nil if timed out
  end

  def key(type)
    "jobs/#{self.class.name}/#{job_id}/#{type}"
  end

  def results_key
    key(:results)
  end

  def enqueue_time_key
    key(:enqueue_time)
  end

  def start_time_key
    key(:start_time)
  end

  def end_time_key
    key(:end_time)
  end

  def cache
    Cdo::SharedCache.cache
  end

  def write_results(results)
    cache.write(results_key, results)
  end

  def write_enqueue_time
    cache.write(enqueue_time_key, Time.now)
  end

  def write_start_time
    cache.write(start_time_key, Time.now)
  end

  def write_end_time
    cache.write(end_time_key, Time.now)
  end

  def timeout(&block)
    Timeout.timeout(@@timeout_s, &block)
  end
end
