class ApplicationJob < ActiveJob::Base
  include ActiveJobMetrics
  include ActiveJobReporting

  # Automatically retry jobs that encountered a deadlock
  # retry_on ActiveRecord::Deadlocked

  # Most jobs are safe to ignore if the underlying records are no longer available
  # discard_on ActiveJob::DeserializationError

  # Ensure that read-only controller actions using the `:reading` ActiveRecord Role
  # can still write to the database to enqueue jobs.
  around_enqueue do |_job, block|
    ActiveRecord::Base.connected_to(role: :writing, &block)
  end
end
