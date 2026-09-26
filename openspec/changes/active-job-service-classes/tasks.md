## 1. Queue configuration

- [ ] 1.1 Add canonical `realtime`, `asap`, and `batch` queues with priorities -10, 0, and 10.
- [ ] 1.2 Derive realtime, asap, and general worker allocations from configured percentages and each environment's existing worker total; add pool-specific polling intervals.
- [ ] 1.3 Validate queue names, priorities, pool percentages, derived worker totals, worker indexes, and service-class coverage at startup.
- [ ] 1.4 Retain legacy queue aliases and dual-read filters for the migration period.

## 2. Worker pools

- [ ] 2.1 Introduce a worker specification containing a queue allowlist and polling interval for each numeric process index.
- [ ] 2.2 Start each `Delayed::Worker` with the worker specification while preserving `delayed_job.N` process names.
- [ ] 2.3 Interleave worker specifications so each rolling restart batch retains realtime and asap capacity.
- [ ] 2.4 Add worker-manager tests for percentage allocation, whole-worker rounding, production and small-environment totals, filters, polling intervals, scale changes, invalid configuration, and restart batches.

## 3. Job routing

- [ ] 3.1 Move AI Chat to `realtime` and assert its queue in tests.
- [ ] 3.2 Move lesson summary, podcast, evaluation, lockout, roster sync, and sample jobs to `asap` and assert their queues in tests.
- [ ] 3.3 Move anonymous geo backfill, inactive-user cleanup, PII scrubbing, inactive-teacher warning, and tutorial refresh jobs to `batch` and assert their queues in tests.
- [ ] 3.4 Audit asynchronous mail call sites and route transactional user-blocking mail to `realtime` and bulk or maintenance mail to `batch`.
- [ ] 3.5 Add an integration test proving each worker pool reserves only allowed queues and honors priority within its allowlist.

## 4. Metrics

- [ ] 4.1 Change `PendingJobCount` to include every non-failed job, including future scheduled jobs.
- [ ] 4.2 Keep `WorkableQueueJobCount` limited to non-failed jobs whose `run_at` has arrived.
- [ ] 4.3 Derive waiting-to-start from workable, unlocked jobs and running from non-failed, locked jobs.
- [ ] 4.4 Clamp oldest pending age at zero for a queue containing only future scheduled jobs.
- [ ] 4.5 Preserve every existing metric name and aggregate dimension; add service-class dimensions only as parallel series.
- [ ] 4.6 Add tests that distinguish future scheduled, ready, running, and failed jobs.

## 5. Rollout

- [ ] 5.1 Deploy dual-read consumers before any producer writes a canonical queue name.
- [ ] 5.2 Verify pool capacity survives a rolling restart and record database polling load at the one-second interval.
- [ ] 5.3 Deploy producer routing and the metric correction; annotate the `PendingJobCount` semantic change in CloudWatch.
- [ ] 5.4 Monitor realtime wait age, queue depth, worker utilization, errors, database load, and batch age through a representative production cycle.
- [ ] 5.5 Confirm no ready, running, or future scheduled job remains on a legacy queue for the agreed drain window.
- [ ] 5.6 Remove legacy aliases and dual-read filters after the drain check passes.
