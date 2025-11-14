require 'cdo/honeybadger'

module DelayedJobManagement
  extend ActiveSupport::Concern

  def archive_failed_jobs
    return unless ActiveRecord::Base.connection.table_exists? 'failed_delayed_jobs'

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

  def migrate_failed_jobs
    archive_failed_jobs
  end
  module_function :migrate_failed_jobs

  class_methods do
    def archive_failed_jobs
      DelayedJobManagement.archive_failed_jobs
    end

    def migrate_failed_jobs
      DelayedJobManagement.migrate_failed_jobs
    end
  end
end
