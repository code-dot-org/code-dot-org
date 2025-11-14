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

  protected def mine(jobs)
    jobs.where('handler LIKE ?', "%job_class: #{self.class.name}%")
  end

  # Failed jobs are those that have failed at least once.
  def self.failed_jobs
    Delayed::Job.where.not(failed_at: nil)
  end

  def failed_jobs
    mine(ActiveJobMetrics.failed_jobs)
  end

  # Queued jobs includes all jobs that aren't yet complete, including those scheduled
  # to run in the future, those currently running, and those that are waiting to run
  def self.queued_jobs
    Delayed::Job.where(failed_at: nil)
  end

  def queued_jobs
    mine(ActiveJobMetrics.queued_jobs)
  end

  # Overridable for testing
  def self._now_utc
    Time.now.utc
  end

  # Pending jobs are those that could be run/running schedule-wise, but have either not yet started
  # or have not yet run to completion (success/failure)
  def self.pending_jobs
    queued_jobs.where('run_at <= ?', _now_utc)
  end

  def pending_jobs
    mine(ActiveJobMetrics.pending_jobs)
  end

  # Waiting To Start Jobs are those that would be valid to run but are not currently being run (="not locked")
  def self.waiting_to_start_jobs
    pending_jobs.where(locked_at: nil)
  end

  def waiting_to_start_jobs
    mine(ActiveJobMetrics.waiting_to_start_jobs)
  end

  def self.oldest_job_age_s(jobs)
    oldest_job = jobs.order(:created_at).first
    oldest_job ? _now_utc - oldest_job.created_at : 0
  end

  def self.oldest_pending_job_age_s
    oldest_job_age_s(pending_jobs)
  end

  def oldest_pending_job_age_s
    ActiveJobMetrics.oldest_job_age_s(pending_jobs)
  end

  def self.oldest_waiting_to_start_job_age_s
    oldest_job_age_s(waiting_to_start_jobs)
  end

  def oldest_waiting_to_start_job_age_s
    ActiveJobMetrics.oldest_job_age_s(waiting_to_start_jobs)
  end

  def self.report_metrics(job_class, dimensions:)
    metrics = [
      {
        metric_name: 'QueuedJobCount',
        value: job_class.queued_jobs.count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: dimensions,
      },
      {
        metric_name: 'PendingJobCount',
        value: job_class.pending_jobs.count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: dimensions
      },
      {
        metric_name: 'FailedJobCount',
        value: job_class.failed_jobs.count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: dimensions,
      },
      {
        metric_name: 'WaitingToStartJobCount',
        value: job_class.waiting_to_start_jobs.count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: dimensions,
      },
      {
        metric_name: 'OldestPendingJobAge',
        value: job_class.oldest_pending_job_age_s,
        unit: 'Seconds',
        timestamp: Time.now,
        dimensions: dimensions,
      },
      {
        metric_name: 'OldestWaitingToStartJobAge',
        value: job_class.oldest_waiting_to_start_job_age_s,
        unit: 'Seconds',
        timestamp: Time.now,
        dimensions: dimensions,
      },
    ]

    Cdo::Metrics.push(METRICS_NAMESPACE, metrics)
  end

  def self.report_overall_queue_metrics
    ActiveJobMetrics.report_metrics(ActiveJobMetrics, dimensions: [{name: 'Environment', value: CDO.rack_env}])
  end

  protected def report_job_count
    ActiveJobMetrics.report_overall_queue_metrics
    ActiveJobMetrics.report_metrics(self, dimensions: common_dimensions)
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
