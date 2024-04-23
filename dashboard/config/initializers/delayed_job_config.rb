# Prevents auto-deletion of failed jobs.
# The failed jobs will be marked with non-null `failed_at`.
Delayed::Worker.destroy_failed_jobs = false
