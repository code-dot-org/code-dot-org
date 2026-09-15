## Why

All Active Job workers currently draw from the same capacity. A long-running job can therefore delay an AI Chat response even though the two jobs have different latency requirements. Queue priority changes reservation order, but it does not reserve capacity and cannot preempt a running job.

The system needs a small number of explicit service classes and worker pools that keep user-blocking work moving without giving every job its own queue. Existing CloudWatch metric names must remain stable so their history is preserved.

## What Changes

- Define three Active Job service classes: `realtime`, `asap`, and `batch`.
- Reserve workers for realtime jobs and for the combined realtime/asap workload. Let the remaining workers run all three classes.
- Give realtime work the highest reservation priority and a shorter idle polling interval.
- Route AI Chat and transactional mail to realtime, long-running lesson summary and evaluation work to asap, and maintenance/backfill work to batch.
- Collapse the `mailers` and `mailjet` transport queues into service classes chosen by latency requirement rather than delivery mechanism.
- Preserve all existing CloudWatch metric names. Correct `PendingJobCount` in place so it includes future scheduled jobs, while `WorkableQueueJobCount` continues to include only jobs whose `run_at` has arrived.
- Migrate queue producers and consumers in separate deployments so jobs already stored under legacy queue names remain executable.

## Capabilities

### New Capabilities

- `active-job-scheduling`: Classify jobs by latency requirement, reserve worker capacity for latency-sensitive classes, retain compatible operational metrics, and migrate without stranding queued jobs.

### Modified Capabilities

<!-- No existing OpenSpec capability requires modification. -->

## Impact

- `lib/cdo/active_job_backend.rb` — construct service-class worker pools while retaining stable worker process names and rolling restarts.
- `config.yml.erb` and environment configuration — declare service-class priorities, worker allocations, queue aliases, and polling intervals.
- `dashboard/config/application.rb` and `dashboard/config/initializers/delayed_job_config.rb` — register canonical queues and validate their configuration.
- Active Job classes under `dashboard/app/jobs/` — assign each job to a service class.
- `dashboard/app/jobs/concerns/active_job_metrics.rb` — correct pending/workable definitions without renaming metrics.
- Worker-manager, job, and metrics tests — cover allocation, routing, priority, polling, scale changes, and scheduled jobs.
- Production deployment — use a consumer-first queue migration and annotate the `PendingJobCount` semantic correction in CloudWatch.
