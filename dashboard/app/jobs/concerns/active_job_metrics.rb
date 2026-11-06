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

  def self.select_one
    ->(sql) {Delayed::Job.connection.select_one(sql)}
  end

  # The minutely cron publishes the same queue-wide metrics. Publishing them on
  # enqueue as well lets KEDA see a burst before the next cron run. Worker
  # metrics come only from the cron: this process cannot see the workers.
  protected def report_job_count
    now = Time.now.utc
    Cdo::ActiveJobQueueMetrics.report_overall(ActiveJobMetrics.select_one, environment: CDO.rack_env, now: now)
    Cdo::ActiveJobQueueMetrics.report_job(ActiveJobMetrics.select_one, job_class: self.class.name, environment: CDO.rack_env, now: now)
  rescue => exception
    Observability::Errors.report(exception, error_message: 'Error reporting ActiveJob metrics')
  end

  protected def report_wait_time
    # Record the time the job started
    @perform_started_at = Time.now
    @enqueued_or_started_at = Time.now

    # Log wait times only for jobs that were enqueued
    return if enqueued_at.nil?

    # In Rails 7.1, `enqueued_at` was changed from an ISO8601 String to a Time
    # object and so no longer needs to be parsed.
    # See: https://github.com/rails/rails/blob/7-1-stable/activejob/CHANGELOG.md#rails-710rc1-september-27-2023
    # TODO infra: simplify this once we've fully updated to Rails 7.1
    @enqueued_or_started_at =
      if Rails::VERSION::MAJOR == 7 && Rails::VERSION::MINOR == 0
        Time.parse(enqueued_at)
      elsif Rails::VERSION::MAJOR == 7 && Rails::VERSION::MINOR == 1
        enqueued_at
      else
        throw "remove this temporary transitional logic before upgrading beyond Rails 7.1"
      end
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
