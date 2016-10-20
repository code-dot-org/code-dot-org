class CodeTimer
  def initialize(user_id)
    @start_time = Time.now
    @current_user_id = user_id
  end

  def record_timing(event_tag)
    return unless CDO.newrelic_logging && @current_user_id >= 0 && (@current_user_id % 10) == 1
    seconds_elapsed = Time.now - @start_time
    NewRelic::Agent.record_metric("Custom/CodeProfiling/#{event_tag}", 1000 * seconds_elapsed)
    @start_time = Time.now
  end
end
