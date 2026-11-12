require 'cdo/aws/metrics'
require 'cdo/honeybadger'
require 'cdo/active_job_queue_metrics'

module ActiveJobMetrics
  extend ActiveSupport::Concern

  METRICS_NAMESPACE = Cdo::ActiveJobQueueMetrics::NAMESPACE

  included do
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
    after_enqueue :report_enqueued
    before_perform :report_wait_time
    after_perform :report_performance
  end

  protected def common_dimensions
    [
      {name: 'Environment', value: CDO.rack_env},
      {name: 'JobName', value: self.class.name},
    ]
  end

  # Queue depth, per class and overall, comes from the minutely
  # report_activejob_metrics cron, so enqueue costs no queries.
  protected def report_enqueued
    Cdo::Metrics.push(
      METRICS_NAMESPACE, [
        {
          metric_name: 'EnqueuedCount',
          value: 1,
          unit: 'Count',
          timestamp: Time.now,
          dimensions: common_dimensions,
        },
      ]
    )
  rescue => exception
    Observability::Errors.report(exception, error_message: 'Error reporting ActiveJob metrics')
  end

  protected def report_wait_time
    # Record the time the job started
    @perform_started_at = Time.now
    @enqueued_or_started_at = Time.now

    # Log wait times only for jobs that were enqueued
    return if enqueued_at.nil?

    @enqueued_or_started_at = enqueued_at
    wait_time = @perform_started_at - @enqueued_or_started_at

    Cdo::Metrics.push(
      METRICS_NAMESPACE, [
        {
          metric_name: 'WaitTime',
          value: wait_time,
          unit: 'Seconds',
          timestamp: Time.now,
          dimensions: common_dimensions,
        },
      ]
    )
  rescue => exception
    Observability::Errors.report(exception, error_message: 'Error reporting ActiveJob metrics')
  end

  protected def report_performance
    perform_complete_at = Time.now

    Cdo::Metrics.push(
      METRICS_NAMESPACE, [
        {
          metric_name: 'ExecutionTime',
          value: perform_complete_at - @perform_started_at,
          unit: 'Seconds',
          timestamp: Time.now,
          dimensions: common_dimensions,
        },
        {
          metric_name: 'TotalTime',
          value: perform_complete_at - @enqueued_or_started_at,
          unit: 'Seconds',
          timestamp: Time.now,
          dimensions: common_dimensions,
        },
      ]
    )
  rescue => exception
    Observability::Errors.report(exception, error_message: 'Error reporting ActiveJob metrics')
  end
end
