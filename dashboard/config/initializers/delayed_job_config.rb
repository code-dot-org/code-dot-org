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

# Configures the DelayedJob priority for each ActiveJob queue.
#
# Lower values have higher priority. Each available worker attempts to reserve
# the runnable job with the lowest priority value from the queues it processes.
#
# Priority affects selection order only. It does not interrupt running jobs,
# reserve workers, or limit queue concurrency.
#
# For example, suppose 100 workers become available with 150 priority-0 jobs and 200 priority-10 jobs ready to run:
#
#   Wave 1: 100 priority-0 jobs
#   Wave 2: 50 priority-0 jobs + 50 priority-10 jobs
#   Wave 3: 100 priority-10 jobs
#   Wave 4: 50 priority-10 jobs
#
# @see https://github.com/collectiveidea/delayed_job#named-queues
Delayed::Worker.queue_attributes = CDO.active_job_queues.each_with_object({}) do |(name, queue), queue_attributes|
  queue_attributes[queue] = {
    priority: CDO.active_job_queue_priorities[name].to_i,
  }
end

# Retries deletion of a completed DelayedJob record when the database raises a deadlock.
# This prevents a successfully executed job from being treated as failed
# and potentially executed again because its queue record could not be removed.
module DelayedJobDestroyDeadlockRetry
  def destroy(...)
    Retryable.retryable(on: ActiveRecord::Deadlocked, tries: 3, sleep: proc {rand(0.1..0.5)}) do
      super
    end
  rescue ActiveRecord::Deadlocked => exception
    Observability::Errors.report(exception)
    raise
  end
end
Delayed::Backend::ActiveRecord::Job.prepend(DelayedJobDestroyDeadlockRetry)
