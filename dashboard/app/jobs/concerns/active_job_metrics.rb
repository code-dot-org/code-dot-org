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
  def self.failed_jobs
    Delayed::Job.where.not(failed_at: nil)
  end

  # Queued jobs could include jobs that are scheduled to be run in the future
  # but aren't valid to start running yet.
  def self.queued_jobs
    Delayed::Job.where(failed_at: nil)
  end

  # Pending jobs are those that could be run/running schedule-wise, but have either not yet started
  # or have not yet run to completion (success/failure)
  def self.pending_jobs
    queued_jobs.where('run_at <= ?', Time.now)
  end

  # Waiting To Start Jobs are those that would be valid to run but are not currently being run (="not locked")
  def self.waiting_to_start_jobs
    pending_jobs.where(locked_at: nil)
  end

  def self.oldest_job_age_in_seconds(jobs)
    oldest_job = jobs.order(:created_at).first
    oldest_job ? Time.now.utc - oldest_job.created_at : 0
  end

  def self.report_generic_queue_metrics
    # QueuedJobs > PendingJobs > WaitingToStartJobs
    generic_metrics = [
      {
        metric_name: 'QueuedJobCount',
        value: queued_jobs.count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: [{name: 'Environment', value: CDO.rack_env}]
      },
      {
        metric_name: 'PendingJobCount',
        value: pending_jobs.count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: [{name: 'Environment', value: CDO.rack_env}]
      },
      {
        metric_name: 'FailedJobCount',
        value: failed_jobs.count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: [{name: 'Environment', value: CDO.rack_env}]
      },
      {
        metric_name: 'WaitingToStartJobCount',
        value: waiting_to_start_jobs.count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: [{name: 'Environment', value: CDO.rack_env}]
      },
      {
        metric_name: 'OldestPendingJobAge',
        value: oldest_job_age_in_seconds(pending_jobs),
        unit: 'Seconds',
        timestamp: Time.now,
        dimensions: [{name: 'Environment', value: CDO.rack_env}]
      },
      {
        metric_name: 'OldestWaitingToStartJobAge',
        value: oldest_job_age_in_seconds(waiting_to_start_jobs),
        unit: 'Seconds',
        timestamp: Time.now,
        dimensions: [{name: 'Environment', value: CDO.rack_env}]
      },
    ]

    Cdo::Metrics.push(METRICS_NAMESPACE, generic_metrics)
  end

  def my(jobs)
    jobs.where('handler LIKE ?', "%job_class: #{self.class.name}%")
  end

  protected def report_job_count
    report_generic_queue_metrics

    per_job_class_metrics = [
      {
        metric_name: 'QueuedJobCount',
        value: my(queued_jobs).count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: [{name: 'Environment', value: CDO.rack_env}]
      },
      {
        metric_name: 'PendingJobCount',
        value: my(pending_jobs).count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: common_dimensions
      },
      {
        metric_name: 'FailedJobCount',
        value: my(failed_jobs).count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: common_dimensions
      },
      {
        metric_name: 'WaitingToStartJobCount',
        value: my(waiting_to_start_jobs).count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: [{name: 'Environment', value: CDO.rack_env}]
      },
    ]

    # Push metrics
    Cdo::Metrics.push(METRICS_NAMESPACE, per_job_class_metrics)
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
