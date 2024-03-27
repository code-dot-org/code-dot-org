require 'cdo/aws/metrics'

class ApplicationJob < ActiveJob::Base
  # Automatically retry jobs that encountered a deadlock
  # retry_on ActiveRecord::Deadlocked

  # Most jobs are safe to ignore if the underlying records are no longer available
  # discard_on ActiveJob::DeserializationError

  METRICS_NAMESPACE = 'code-dot-org/ActiveJob'

  def self.common_dimensions
    [
      {
        name: 'Environment',
        value: CDO.rack_env
      },
      {
        name: 'JobName',
        value: name
      }
    ]
  end

  # Parent class callbacks are called in addition to any callbacks defined in the job subclass
  # https://guides.rubyonrails.org/v6.0/active_job_basics.html#available-callbacks

  after_enqueue do |_job|
    job_count = Delayed::Job.count

    metrics = [
      {
        # Same metric as "bin/cron/report_activejob_metrics"
        metric_name: 'JobCount',
        value: job_count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: {
          name: 'Environment',
          value: CDO.rack_env
        },
      }
    ]

    Cdo::Metrics.push(METRICS_NAMESPACE, metrics)
  end

  before_perform do |job|
    @perform_started_at = Time.now
    wait_time = @perform_started_at - Time.parse(job.enqueued_at)

    metrics = [
      {
        metric_name: 'WaitTime',
        value: wait_time,
        unit: 'Seconds',
        timestamp: Time.now,
        dimensions: job.class.common_dimensions,
      }
    ]

    Cdo::Metrics.push(METRICS_NAMESPACE, metrics)
  end

  after_perform do |job|
    perform_complete_at = Time.now
    execution_time = perform_complete_at - @perform_started_at
    total_time = perform_complete_at - Time.parse(job.enqueued_at)

    metrics = [
      {
        metric_name: 'ExecutionTime',
        value: execution_time,
        unit: 'Seconds',
        timestamp: Time.now,
        dimensions: job.class.common_dimensions,
      },
      {
        metric_name: 'TotalTime',
        value: total_time,
        unit: 'Seconds',
        timestamp: Time.now,
        dimensions: job.class.common_dimensions,
      }
    ]

    Cdo::Metrics.push(METRICS_NAMESPACE, metrics)
  end
end
