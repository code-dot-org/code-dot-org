require 'cdo/aws/metrics'

module DelayedJobManager
  METRICS_NAMESPACE = 'code-dot-org/ActiveJob'.freeze

  # Delayed::Job performance degrades sharply once the main `delayed_jobs` table
  # accumulates too many rows, which often happens when failures pile up (AI chat
  # jobs are our current hot spot). We archive those failures into a secondary
  # table so engineers can still inspect them while keeping the primary queue
  # lean. Long term we plan to migrate queue processing to SolidQueue, at which
  # point we expect to retire this archive entirely; in the meantime we’re also
  # exploring treating some downstream errors as handled (e.g., marking AI chat
  # jobs successful after logging and/or notifying) to reduce churn.
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
    CDO.log.warn("Failed to record #{metric_name} metric for DelayedJobManager: #{exception}")
  end
  module_function :archive_failed_jobs
end
