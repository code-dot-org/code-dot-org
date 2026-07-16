# Prevents auto-deletion of failed jobs.
# The failed jobs will be marked with non-null `failed_at`.
Delayed::Worker.destroy_failed_jobs = false

# Turn off "delayed_job" retry behavior, relying only on ActiveJob's own retry
# behavior. When you're using delayed_job as a backend to ActiveJob, you end up
# with two retry mechanisms: first from ActiveJob, configurable using the
# retry_on method, and second from delayed_job, which is controlled by the
# max_attempts variable.
Delayed::Worker.max_attempts = 1

Delayed::Worker.logger = Logger.new(File.join(Rails.root, 'log', 'delayed_job.log'))

# Retries deletion of a completed DelayedJob record once when the database raises a deadlock.
# This prevents a successfully executed job from being treated as failed
# and potentially executed again because its queue record could not be removed.
module DelayedJobDestroyDeadlockRetry
  def destroy(...)
    super
  rescue ActiveRecord::Deadlocked
    sleep rand(0.05..0.1) # Brief jitter reduces the chance of jobs immediately colliding again

    begin
      super
    rescue ActiveRecord::Deadlocked => exception
      Observability::Errors.capture_exception(exception) if defined?(Observability::Errors)
      raise
    end
  end
end
Delayed::Backend::ActiveRecord::Job.prepend(DelayedJobDestroyDeadlockRetry)
