require 'cdo/aws/metrics'
require 'cdo/honeybadger'

module DelayedJobManager
  METRICS_NAMESPACE = 'code-dot-org/ActiveJob'.freeze

  # Delayed::Job performance degrades sharply once the main `delayed_jobs` table
  # accumulates too many rows, which often happens when failures pile up. We
  # archive those failures into a secondary table so engineers can still inspect
  # them while keeping the primary queue lean. Long term we plan to migrate
  # queue processing to SolidQueue, which is blocked until we're on Rails 7.
  def archive_failed_jobs
    return unless FailedDelayedJob.table_exists?

    archived_count = 0
    Delayed::Job.where.not(failed_at: nil).find_in_batches do |batch|
      ActiveRecord::Base.transaction do
        failed_jobs_attributes = batch.map(&:attributes)
        FailedDelayedJob.insert_all(failed_jobs_attributes)
        Delayed::Job.where(id: batch.map(&:id)).delete_all
      end
      archived_count += batch.size
    end

    record_metric('FailedJobsArchived', archived_count)
    archived_count
  rescue
    record_metric('FailedJobArchiveFailures', 1)
    raise
  end

  def record_metric(metric_name, value)
    Cdo::Metrics.push(
      METRICS_NAMESPACE,
      [
        {
          metric_name: metric_name,
          value: value,
          unit: 'Count',
          timestamp: Time.now,
          dimensions: [{name: 'Environment', value: CDO.rack_env}],
        }
      ]
    )
  rescue => exception
    Honeybadger.notify(
      exception,
      error_message: "Failed to record #{metric_name} metric for DelayedJobManager"
    )
  end
  module_function :archive_failed_jobs
end
