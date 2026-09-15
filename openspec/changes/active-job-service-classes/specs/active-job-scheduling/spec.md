## Purpose

Define how Dashboard classifies Active Job work by latency requirement, protects capacity for user-blocking jobs, reports queue state, and changes persisted queue names without stranding work.

## ADDED Requirements

### Requirement: Jobs use one of three latency service classes
The system SHALL expose `realtime`, `asap`, and `batch` as the canonical Active Job queues. A job's queue SHALL describe its latency requirement rather than its subsystem or transport.

#### Scenario: AI Chat is realtime
- **WHEN** an AI Chat completion job is enqueued
- **THEN** it is stored on the `realtime` queue

#### Scenario: Lesson summary is asap
- **WHEN** a lesson summary job is enqueued
- **THEN** it is stored on the `asap` queue and does not use realtime-only capacity

#### Scenario: Anonymous geo backfill is batch
- **WHEN** an anonymous geo backfill job is enqueued
- **THEN** it is stored on the `batch` queue

### Requirement: Realtime work has dedicated capacity
Production SHALL reserve at least 10% of configured Active Job workers exclusively for realtime work. The system SHALL derive the reserve from the configured total worker count rather than store an absolute production worker count. An idle realtime-reserved worker SHALL discover a workable realtime job within its configured polling interval, excluding persistence and database reservation time.

#### Scenario: Batch saturates general workers
- **WHEN** every general worker is running a batch job and a realtime-reserved worker is idle
- **THEN** a newly workable AI Chat job can be reserved by the realtime worker without waiting for a batch job to finish

#### Scenario: Slow asap work saturates its eligible workers
- **WHEN** every asap and general worker is running a long job and a realtime-reserved worker is idle
- **THEN** a newly workable realtime job can be reserved by the realtime worker

### Requirement: Realtime work can use shared capacity
Realtime jobs SHALL be eligible on realtime, asap, and general worker pools so realtime traffic can use the full fleet as workers become free.

#### Scenario: Realtime burst exceeds reserved capacity
- **WHEN** realtime queue depth exceeds the realtime reserve and an asap or general worker becomes idle
- **THEN** that worker may reserve realtime work before lower-priority eligible work

### Requirement: ASAP work is isolated from realtime-only capacity and batch work
ASAP jobs SHALL be eligible on asap and general workers, but SHALL NOT be eligible on realtime-only workers. Batch jobs SHALL be eligible only on general workers.

#### Scenario: Realtime reserve is idle while asap is queued
- **WHEN** only asap jobs are queued and a realtime-only worker is idle
- **THEN** the realtime-only worker does not reserve an asap job

#### Scenario: Batch work is queued while a reserved worker is idle
- **WHEN** batch jobs are queued and a realtime or asap reserved worker is idle
- **THEN** the reserved worker does not reserve a batch job

### Requirement: Queue priority orders work within a worker allowlist
The system SHALL assign lower numeric priority to realtime than asap, and lower numeric priority to asap than batch. Priority SHALL affect the next reservation only and SHALL NOT imply preemption of running jobs.

#### Scenario: One worker can reserve all service classes
- **WHEN** a general worker becomes idle while workable realtime, asap, and batch jobs exist
- **THEN** it reserves realtime work first

#### Scenario: Realtime arrives while a batch job is running
- **WHEN** a general worker is already executing a batch job and realtime work becomes workable
- **THEN** the running batch job continues and another eligible worker must reserve the realtime job

### Requirement: Worker allocation is explicit and valid
Worker pool configuration SHALL use percentages that total 100. Startup SHALL derive whole-worker allocations from the configured Active Job worker count, assign every worker an explicit pool, queue allowlist, and polling interval, and give the general pool any workers left after reserve rounding. Startup SHALL fail if percentages are negative or do not total 100, derived allocations do not cover the configured worker count, a pool refers to an unknown queue, a worker index is assigned more than once, or a canonical service class has no eligible worker.

#### Scenario: Pool percentages do not total 100
- **WHEN** the configured pool percentages do not total 100
- **THEN** worker startup fails with an error that identifies the configured total

#### Scenario: Worker count changes
- **WHEN** the configured Active Job worker count changes
- **THEN** startup derives new pool allocations from the configured percentages and does not reuse absolute counts from the previous worker total

#### Scenario: Valid small environment starts
- **WHEN** an environment assigns at least one realtime worker and one general worker and every canonical queue has an eligible worker
- **THEN** workers start with their configured filters and polling intervals

#### Scenario: Two-worker environment uses the minimum valid allocation
- **WHEN** an environment configures two Active Job workers
- **THEN** startup assigns one realtime-reserved worker and one general worker, with no separate asap reserve

### Requirement: Rolling restarts retain latency-sensitive capacity
Worker specifications SHALL be distributed across numeric process indexes so a normal rolling restart batch does not stop every realtime-reserved worker or every asap-reserved worker at once. Existing `delayed_job.N` process names SHALL remain stable.

#### Scenario: One restart batch is replaced
- **WHEN** the worker manager restarts one normal batch of numeric worker processes
- **THEN** at least one realtime-reserved worker and one asap-capable worker outside that batch remain running

### Requirement: Transactional mail is classified by latency requirement
Mail delivery SHALL NOT use a canonical queue based only on delivery transport. User-blocking transactional mail SHALL use realtime. Bulk, campaign, cleanup, or warning mail SHALL use batch unless its call site documents another latency requirement.

#### Scenario: Password reset mail is asynchronous
- **WHEN** a password reset message is enqueued for asynchronous delivery
- **THEN** its delivery job uses `realtime`

#### Scenario: Inactive-user warning mail is enqueued
- **WHEN** inactive-user warning mail is scheduled as maintenance work
- **THEN** its delivery work uses `batch`

### Requirement: Existing CloudWatch metric names remain stable
The system SHALL retain the existing Active Job CloudWatch metric names and aggregate dimensions. New service-class dimensions MAY be emitted as parallel series, but SHALL NOT replace the aggregate series.

#### Scenario: Service-class metrics are added
- **WHEN** queue counts are emitted with a `ServiceClass` dimension
- **THEN** the same named aggregate metrics continue to be emitted without that dimension

### Requirement: Pending and workable metrics have distinct time semantics
`PendingJobCount` SHALL count every non-failed job, including jobs scheduled for the future. `WorkableQueueJobCount` SHALL count non-failed jobs whose `run_at` is at or before the observation time. `WaitingToStartJobCount` SHALL count workable jobs that are not locked, and `RunningJobCount` SHALL count non-failed jobs that are locked.

#### Scenario: A job is scheduled for the future
- **WHEN** a non-failed, unlocked job has `run_at` later than the observation time
- **THEN** it contributes to `PendingJobCount` but not `WorkableQueueJobCount`, `WaitingToStartJobCount`, or `RunningJobCount`

#### Scenario: A ready job waits for a worker
- **WHEN** a non-failed, unlocked job has `run_at` at or before the observation time
- **THEN** it contributes to `PendingJobCount`, `WorkableQueueJobCount`, and `WaitingToStartJobCount`

#### Scenario: A worker is running a job
- **WHEN** a non-failed job is locked by a worker
- **THEN** it contributes to `PendingJobCount` and `RunningJobCount`

#### Scenario: A job has failed
- **WHEN** a job has a non-null `failed_at`
- **THEN** it contributes to none of the pending, workable, waiting-to-start, or running counts

### Requirement: Oldest pending age is never negative
`OldestPendingJobAge` SHALL emit zero rather than a negative duration when the oldest pending job is scheduled for the future.

#### Scenario: Every pending job is scheduled for the future
- **WHEN** the earliest `run_at` among non-failed jobs is later than the observation time
- **THEN** `OldestPendingJobAge` is zero

### Requirement: Queue migration does not strand persisted jobs
Consumers SHALL accept canonical and legacy queue names before any producer writes canonical names. Legacy names SHALL remain accepted until no ready, running, or future scheduled job can use them.

#### Scenario: A legacy job exists during producer migration
- **WHEN** a job stored on `default`, `mailers`, `mailjet`, or `low_priority` becomes workable during the migration period
- **THEN** at least one worker pool is eligible to reserve it

#### Scenario: Legacy filters are removed
- **WHEN** legacy queue filters are removed from worker configuration
- **THEN** no ready, running, or future scheduled job remains on a legacy queue and current producers write only canonical queue names
