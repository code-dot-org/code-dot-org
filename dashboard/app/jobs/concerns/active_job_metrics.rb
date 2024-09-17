require 'cdo/aws/metrics'
require 'cdo/honeybadger'

module ActiveJobMetrics
  extend ActiveSupport::Concern

  METRICS_NAMESPACE = 'code-dot-org/ActiveJob'.freeze

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
    after_enqueue :report_job_count
    before_perform :report_wait_time
    after_perform :report_performance
  end

  protected def common_dimensions
    [
      {name: 'Environment', value: CDO.rack_env},
      {name: 'JobName', value: self.class.name},
    ]
  end

  # Failed jobs are those that have failed at least once.
  def get_failed_job_count
    Delayed::Job.where.not(failed_at: nil).count
  end

  # Pending jobs are those that have not yet been run.
  def get_pending_job_count
    Delayed::Job.where(failed_at: nil).count
  end

  # Workable jobs are those that are not locked and are ready to run.
  def get_workable_job_count
    Delayed::Job.where(failed_at: nil, locked_at: nil).where('run_at <= ?', Time.now).count
  end

  protected def report_job_count
    Cdo::Metrics.push(METRICS_NAMESPACE,
      # Same metrics as "bin/cron/report_activejob_metrics"
      [
        {
          metric_name: 'PendingJobCount',
          value: get_pending_job_count,
          unit: 'Count',
          timestamp: Time.now,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
          ],
        },
        {
          metric_name: 'FailedJobCount',
          value: get_failed_job_count,
          unit: 'Count',
          timestamp: Time.now,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
          ],
        },
        {
          metric_name: 'WorkableJobCount',
          value: get_workable_job_count,
          unit: 'Count',
          timestamp: Time.now,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
          ],
        }
      ]
    )
  rescue => exception
    Honeybadger.notify(exception, error_message: 'Error reporting ActiveJob metrics')
  end

  protected def report_wait_time
    # Record the time the job started
    @perform_started_at = Time.now
    @enqueued_or_started_at = Time.now

    # Log wait times only for jobs that were enqueued
    return if enqueued_at.nil?

    @enqueued_or_started_at = Time.parse(enqueued_at)
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
    Honeybadger.notify(exception, error_message: 'Error reporting ActiveJob metrics')
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
    Honeybadger.notify(exception, error_message: 'Error reporting ActiveJob metrics')
  end
end
