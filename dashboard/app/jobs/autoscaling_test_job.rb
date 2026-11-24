require 'socket'

class AutoscalingTestJob < ApplicationJob
  MAX_DURATION_SECONDS = 1800

  queue_as CDO.active_job_queues[:low_priority]

  # With `fail: true` the job raises after the sleep, in place of logging
  # `completed`. That gives a controlled failure for checking metrics, logs and
  # error reports. The `started` event is still logged, so a failing job records
  # which worker took it.
  def perform(run_id:, duration_seconds:, fail: false)
    unless run_id.is_a?(String) && !run_id.strip.empty?
      raise ArgumentError, 'run_id must be a nonblank string'
    end
    unless duration_seconds.is_a?(Integer) && (0..MAX_DURATION_SECONDS).cover?(duration_seconds)
      raise ArgumentError, "duration_seconds must be an integer between 0 and #{MAX_DURATION_SECONDS}"
    end

    context = {
      namespace: 'autoscaling_test_job',
      run_id: run_id,
      job_id: job_id,
      hostname: Socket.gethostname,
      pid: Process.pid,
      duration_seconds: duration_seconds,
    }

    log_event('started', context)
    sleep duration_seconds
    raise 'AutoscalingTestJob failure requested' if fail

    log_event('completed', context)
  end

  private def log_event(event, context)
    CDO.log.info JSON.dump(context.merge(event: event, timestamp: Time.now.utc.iso8601(6)))
  end
end
