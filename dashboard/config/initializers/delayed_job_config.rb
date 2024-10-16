# Prevents auto-deletion of failed jobs.
# The failed jobs will be marked with non-null `failed_at`.
Delayed::Worker.destroy_failed_jobs = false

# Turn off "delayed_job" retry behavior, relying only on ActiveJob's own retry
# behavior. When you're using delayed_job as a backend to ActiveJob, you end up
# with two retry mechanisms: first from ActiveJob, configurable using the
# retry_on method, and second from delayed_job, which is controlled by the
# max_attempts variable.
Delayed::Worker.max_attempts = 1
