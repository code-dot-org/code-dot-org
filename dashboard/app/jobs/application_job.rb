require 'cdo/aws/metrics'
require 'cdo/honeybadger'

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
  # Callback functions are executed in the following order:
  #   before_enqueue and around_enqueue(before) in any order
  #   Job is added to database or other queue store
  #   after_enqueue and around_enqueue(after) in any order
  #   before_perform and around_perform(before) in any order
  #   job is performed
  #   after_perform and around_perform(after) in any order
  # When both the Parent and Child class define the same callback, they may be called in any order.
  # Also note that jobs executed via `.perform_now` will not trigger the `enqueue` callbacks.
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
  rescue => exception
    Honeybadger.notify(exception, error_message: 'Error reporting ActiveJob metrics')
  end

  before_perform do |job|
    # Log wait times only jobs that were enqueued
    return if job.enqueued_at.nil?

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
  rescue => exception
    Honeybadger.notify(exception, error_message: 'Error reporting ActiveJob metrics')
  end

  after_perform do |job|
    perform_complete_at = Time.now
    execution_time = perform_complete_at - @perform_started_at
    total_time = perform_complete_at - @enqueued_or_started_at

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
  rescue => exception
    Honeybadger.notify(exception, error_message: 'Error reporting ActiveJob metrics')
  end
end
