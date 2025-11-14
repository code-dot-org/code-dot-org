require 'cdo/honeybadger'

module DelayedJobManagement
  extend ActiveSupport::Concern

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

    jobs_to_archive = Delayed::Job.where.not(failed_at: nil)

    jobs_to_archive.find_in_batches do |batch|
      ActiveRecord::Base.transaction do
        failed_jobs_attributes = batch.map(&:attributes)
        FailedDelayedJob.insert_all(failed_jobs_attributes)
        Delayed::Job.where(id: batch.map(&:id)).delete_all
      end
    end
  rescue => exception
    Honeybadger.notify(exception, error_message: 'Error archiving failed ActiveJobs')
  end
  module_function :archive_failed_jobs

  class_methods do
    def archive_failed_jobs
      DelayedJobManagement.archive_failed_jobs
    end
  end
end
