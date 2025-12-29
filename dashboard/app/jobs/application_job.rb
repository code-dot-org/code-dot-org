class ApplicationJob < ActiveJob::Base
  include ActiveJobMetrics
  include ActiveJobReporting

  # Automatically retry jobs that encountered a deadlock
  # retry_on ActiveRecord::Deadlocked

  # Most jobs are safe to ignore if the underlying records are no longer available
  # discard_on ActiveJob::DeserializationError

  # Checks whether this job is unique (i.e., not already enqueued with the same class and arguments).
  #
  # This inspects the `delayed_jobs.handler` YAML payload produced by ActiveJob's
  # Delayed Job adapter and searches for a matching `job_class` and serialized `arguments`.
  # When `with_failed` is `false`, failed jobs are ignored; when `true`, failed jobs also count as duplicates.
  #
  # @param with_failed [Boolean] when `true`, considers failed jobs as duplicates; when `false`, ignores them
  # @return [Boolean] `true` if no similar job exists, otherwise `false`
  def unique?(with_failed: false)
    handler_arel = Delayed::Job.arel_table[:handler]

    similar_jobs = Delayed::Job.
      where(handler_arel.matches("--- !ruby/object:#{ActiveJob::QueueAdapters.lookup(:delayed_job)}::JobWrapper\njob_data:\n  job_class: #{self.class.name}%")).
      where(handler_arel.matches("%#{{arguments:}.as_json.to_yaml.delete_prefix("---\n").gsub("\n-", "\n  -")}%"))

    similar_jobs = similar_jobs.where(failed_at: nil) unless with_failed

    similar_jobs.none?
  end
end
