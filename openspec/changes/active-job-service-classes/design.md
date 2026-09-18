## Context

Dashboard runs Active Job through `delayed_job`. The worker total comes from `active_job_backend_n_workers_to_start`; production currently overrides it to 100 in `locals.yml`. All workers currently share the same queue set, so queue priority affects only which job an idle worker reserves next. It does not stop a slow job from occupying every worker, and it does not preempt a running job when higher-priority work arrives.

The present queues mix latency policy with implementation detail. `mailers` and `mailjet` name delivery mechanisms. `default` contains user-facing and non-user-facing work. `low_priority` contains both deferrable work and lesson summaries that should start promptly but can run for one or two minutes.

The existing worker manager gives workers stable numeric process names and restarts them in batches. The design must retain both properties. Existing CloudWatch metric names must also remain unchanged because dashboards and historical time series depend on them.

## Goals / Non-Goals

**Goals:**

- Keep AI Chat and other user-blocking jobs moving when slow or deferrable work saturates its allowed capacity.
- Express three latency policies with three canonical queues, not one queue per job type.
- Let realtime jobs burst into every worker pool when capacity is available.
- Keep batch jobs from consuming capacity reserved for realtime or asap work.
- Derive pool sizes from the configured worker total so a scale change does not require new absolute allocations.
- Preserve metric names and worker process naming.
- Deploy without losing or stranding jobs stored under legacy queue names.

**Non-goals:**

- Replace `delayed_job` or its database-backed storage.
- Define a numeric completion SLA for batch work.
- Retain failed-job data outside the production database.
- Preempt jobs that have already begun running.
- Add automatic worker scaling or dynamically resize pools in this change.
- Rename CloudWatch metrics or recreate their historical time series.

## Decisions

### 1. Use three service classes

The canonical queues are:

| Queue | Priority | Contract |
|---|---:|---|
| `realtime` | -10 | A person is waiting. Start as soon as an eligible worker is free. |
| `asap` | 0 | Start promptly, but the work is slow enough that it must not occupy realtime-only capacity. |
| `batch` | 10 | Complete eventually. Run only on general capacity. |

Lower numeric priorities are reserved first by `delayed_job`. Priority orders jobs that are eligible for the same worker. Queue filters provide the capacity isolation.

During migration, configuration maps the legacy names by policy:

| Legacy queue | Service class |
|---|---|
| `default` | `asap` |
| `mailers` | `realtime` |
| `mailjet` | `realtime` |
| `low_priority` | `batch` |

These are compatibility mappings, not permanent public queue names. Producers move to canonical names after consumers accept both sets.

### 2. Use percentage-based nested worker pools

Production initially divides the configured worker total as follows:

| Pool | Target share | Queues consumed | Idle polling interval |
|---|---:|---|---:|
| Realtime reserve | 10% | `realtime` | 1 second |
| ASAP reserve | 10% | `realtime`, `asap` | 1 second |
| General | 80% | `realtime`, `asap`, `batch` | 5 seconds |

`ActiveJobBackend` derives whole-worker allocations from `active_job_backend_n_workers_to_start`. For totals of three or more, each nonzero reserve rounds up so it does not fall below its target share; the general pool receives the remainder. The percentages must total 100, and the derived allocation must leave at least one general worker. With the current production total of 100, this yields 10 realtime-reserved workers, 10 asap-reserved workers, and 80 general workers. A production scale change recomputes those counts without changing pool configuration.

Realtime work can use 100% of the fleet, asap work can use about 90%, and batch work can use about 80%. When only batch work exists, about 20% of production-sized capacity may remain idle; this is the cost of protecting latency without adding hosts.

Non-production environments use the same percentages with whole-worker rounding. For example, totals of four and five derive allocations of 1/1/2 and 1/1/3. A two-worker environment uses one realtime-reserved worker and one general worker; the general worker provides asap coverage. Environments with fewer than two workers must increase their worker count. Allocation code validates the percentages, derived counts, and service-class coverage.

The pool definitions are interleaved across numeric worker indexes. A rolling restart batch must not contain every realtime-reserved worker or every asap-reserved worker. Process names remain `delayed_job.N` so monitoring and operations do not acquire a second identity scheme.

### 3. Classify jobs by latency, not subsystem

The initial assignment is:

| Service class | Jobs |
|---|---|
| Realtime | `AichatRequestChatCompletionJob`, `MailDeliveryJob`, `MailjetDeliveryJob` when used for transactional mail |
| ASAP | `AiLessonSummariesJob`, `AiLessonSummaryPodcastsJob`, `AiStudentPodcastsJob`, `EvaluateChallengeResponseJob`, `EvaluateRubricJob`, `CAP::LockoutJob`, `Roster::Clever::SyncSectionsJob`, `SampleJob` |
| Batch | `ProjectStorage::AnonymousGeoBackfillingJob`, `InactivityCleanup::StudentDeletionJob`, `InactivityCleanup::TeacherDeletionJob`, `User::InactiveTeacherDeletionWarningJob`, `User::PiiScrubberJob`, `HocLegacy::RefreshTutorialsJob` |

AI Chat defines the first realtime use case. Lesson summaries define the distinction between realtime and asap: they should start promptly, but one job may hold a worker for one or two minutes. Anonymous geo backfilling defines batch work.

Mailer transport does not determine service class. Password resets and other transactional messages that block a person belong in realtime. Bulk, campaign, cleanup, and warning mail belongs in batch. Call sites must select a service class explicitly when a shared delivery job can serve both policies.

### 4. Configure each worker with an explicit queue filter

`ActiveJobBackend` builds a worker specification for each numeric worker index. A specification contains its queue allowlist and polling interval. The manager passes these values to `Delayed::Worker` when it starts the process.

No worker relies on an unfiltered queue list in a configured environment. Startup fails on percentages that are negative or do not total 100, an unknown queue, a duplicate or missing worker index, a derived allocation that does not cover the configured worker count, or a service class with no eligible worker.

### 5. Shorten polling only for latency-sensitive reserves

An idle `delayed_job` worker currently waits five seconds between database polls. Realtime and asap reserve workers poll once per second. General workers retain the five-second interval to limit database traffic. An idle reserved worker therefore notices eligible work within its configured polling interval; job runtime and database reservation time remain outside this guarantee.

### 6. Preserve metrics and correct their definitions in place

The existing names remain unchanged:

| Metric | Definition |
|---|---|
| `QueuedJobCount` | Jobs whose `failed_at` is null, including scheduled, ready, and running jobs. |
| `PendingJobCount` | All jobs whose `failed_at` is null, including jobs scheduled for the future. This intentionally overlaps `QueuedJobCount` to preserve the established metric contract. |
| `WorkableQueueJobCount` | Non-failed jobs whose `run_at` is at or before the observation time. |
| `WaitingToStartJobCount` | Workable jobs that are not locked by a worker. |
| `RunningJobCount` | Non-failed jobs locked by a worker. |

`OldestPendingJobAge` never emits a negative age when all pending jobs are scheduled in the future. Existing aggregate dimensions remain. The implementation may additionally emit the same metric names with a `ServiceClass` dimension, but it does not replace or rename the aggregate series.

Changing `PendingJobCount` creates a semantic discontinuity in the existing time series. The deployment is annotated in CloudWatch and dashboard descriptions are updated. Preserving the name is more important than preserving the current incorrect equivalence with workable jobs.

### 7. Deploy consumers before producers

Queue names are persisted in the production database and scheduled jobs may remain there across several deployments. The rollout has three phases:

1. Deploy worker filters that consume both canonical and legacy queues. Realtime workers accept `realtime`, `mailers`, and `mailjet`; asap workers additionally accept `asap` and `default`; general workers accept all canonical and legacy queues.
2. Deploy producer changes that write canonical queue names and verify queue depth, reservation latency, worker utilization, and errors by service class.
3. After every legacy queue is empty and no scheduled job can repopulate it, remove the legacy names from worker filters and configuration.

Rollback during phases 1 or 2 restores old producers while dual-read consumers remain deployed. No database rewrite is required.

## Risks / Trade-offs

- **Reserved capacity can sit idle.** About 20% of a production-sized fleet does no work when only batch jobs exist. This is intentional and should be revisited with production utilization data.
- **More frequent polling adds database load.** The two reserve pools, nominally 20% of the fleet, use the one-second interval. Database query rate is monitored during rollout.
- **Realtime can starve lower classes.** Nested pools give realtime first access to every pool. Queue age alarms must reveal sustained overload; more job types enter realtime only after review.
- **Running jobs are not preempted.** If all eligible workers are already executing work, a new job waits for one to finish. The realtime-only reserve limits this case but cannot eliminate it.
- **Transport-level mail routing can hide policy.** Shared mail delivery jobs require call-site classification so a bulk send does not enter realtime by accident.
- **Metric correction changes graph shape.** `PendingJobCount` may jump when future scheduled work exists. The name and history remain intact, and the deployment annotation explains the change.
- **Legacy queues can outlive the code that created them.** The final cleanup waits for both ready and future scheduled legacy jobs to disappear.

## Migration Plan

1. Add canonical queue configuration, pool allocation, validation, and dual-read worker filters. Deploy without changing producers.
2. Confirm every legacy queue has an eligible worker in each environment and that rolling restarts retain realtime and asap capacity.
3. Move job classes and mail call sites to canonical queues. Deploy producer changes.
4. Correct metric queries without changing metric names. Add a CloudWatch annotation at deployment time.
5. Observe realtime waiting age, queue depth, worker utilization, database polling load, and batch age through a representative production cycle.
6. Remove legacy queue filters only after ready, running, and future scheduled counts are zero and stay zero for the agreed drain window.

Rollback restores producer assignments first. Dual-read workers remain safe for both old and new queue names. The metric query can be reverted independently if its changed semantics cause an operational problem.

## Open Questions

- Are 10% realtime-only, 10% realtime/asap, and the remainder general the right steady-state production shares after the first observation period, or should the asap reserve change while retaining the 10% realtime floor?
- Which mail call sites, beyond password reset, have a measured user-blocking requirement and should explicitly select realtime?
