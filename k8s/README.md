# Run the Code.org backend under Kubernetes with Skaffold

Skaffold builds and runs the ActiveJob worker with cluster-local MySQL, Redis,
and MinIO. It does not run the dashboard web frontend. Add that workload only
after the root `docker/` family defines and tests an image containing the
frontend assets.

Local Kubernetes and the deployed clusters use the same image family:

```text
cdo-base -> cdo-build -> cdo-deps -> cdo-rails
```

The Dockerfiles and their contracts live under [`docker/`](../docker/README.md).
Skaffold only describes how to build that family and deploy `cdo-rails`.
Before building, it fetches any missing Git LFS locale files required by that
image.

## Prerequisites

Docker Desktop is the supported local Kubernetes provider.

1. Install Docker Desktop and enable Kubernetes.
2. For Docker Desktop installations from before 2025, enable the containerd
   image store.
3. Give Docker at least 100 GB of disk space.
4. Optionally install Headlamp, k9s, or the VS Code Kubernetes extension.

Set `SKAFFOLD_CACHE_ARTIFACTS=false` in your shell environment, or pass
`--cache-artifacts=false` to each command. Skaffold's artifact cache adds more
filesystem scanning than it saves for this repository; Docker's layer cache
still applies.

## Initialize local services

From the repository root:

```sh
skaffold dev --trigger=manual -p setup-db-minimal -p setup-s3
```

This builds the image family, initializes a new database from
`dashboard/db/schema.rb`, and creates the standard MinIO buckets. On later runs,
the database setup skips a database that already matches that schema. It fails
without changing a nonempty database in any other state. The command stays
attached after both jobs finish. Stop it with Ctrl-C after `setup-db-minimal
COMPLETE` and the MinIO setup job both complete. Skaffold replaces these
one-shot Jobs before each deployment because Kubernetes does not permit
changing an existing Job's pod template.

`cdo-rails` does not contain migration history or curriculum seed inputs. The
setup profile therefore initializes a fresh database; it cannot migrate or
seed an existing one. Recreate the local MySQL volume when the checked-in schema
changes. A future migration or seed job must be a separate member of the root
Docker image family.

The MySQL volume and its Kubernetes password survive Skaffold cleanup. Helm
reuses that password even when another worktree has a different generated
`cdo-local-secrets.env`. To discard the local database and start over, stop
Skaffold and run:

```sh
kubectl delete pvc mysql-data-cdo-mysql-0
kubectl delete secret cdo-local-secrets
rm cdo-local-secrets.env
```

The next `skaffold dev` generates one password for the new Secret and volume.
These commands permanently delete the local Kubernetes database.

## Run the worker

```sh
skaffold dev
```

Skaffold tails logs and removes its resources when interrupted. It syncs
matching source changes into the worker container and restarts the process.

Useful commands:

- `skaffold build` builds the root image family without deploying it.
- `skaffold run` deploys the backend without attaching a development loop.
- `k8s/bin/shell` opens `/bin/sh` in the ActiveJob worker.
- `k8s/bin/bundle_exec irb` runs a command through the locked bundle.
- `k8s/bin/rake TASK` runs the locked Rake executable.

The root [`skaffold.yaml`](../skaffold.yaml) deploys the Helm chart in
[`k8s/helm`](helm/).

### Select job priorities

Set `activeJobWorker.priorityMode` in the environment's Helm values:

```yaml
activeJobWorker:
  priorityMode: low
```

| Mode | Eligible Delayed Job priorities | Worker flags |
| --- | --- | --- |
| `both` (default) | All | None |
| `high` | Less than 10 | `--max-priority 9` |
| `low` | 10 or greater | `--min-priority 10` |

Lower numbers run first. The boundary matches `config.yml.erb`: `default`,
`mailers`, and `mailjet` use 0; `low_priority` uses 10. These filters apply to
the priority stored on each job, regardless of its queue name. Keep that
boundary in mind when changing queue priorities.

Changing the mode rolls the Deployment's pods. Running jobs are not reclassified
or interrupted by the filter. Custom `activeJobWorker.command` and `args` are
supported only in `both` mode; filtered modes require the generated command.

`activeJobWorker.terminationGracePeriodSeconds` sets how long a pod being
replaced or drained waits for its current job before Kubernetes kills the
worker. A killed job's row stays locked for `Delayed::Worker.max_run_time`
(4 hours). The chart default is 60; production and staging set 2100 to cover
the 30 minute `AnonymousGeoBackfillingJob` cap. An idle worker exits within
seconds regardless.

During migration, Kubernetes can start with `low` while existing workers
continue consuming both priorities. To move all low-priority work to Kubernetes,
the existing workers must also be configured to consume only high priorities:
set `active_job_worker_max_priority: 9` for them (`config/<env>.yml.erb`,
`globals.yml`, or `CDO_ACTIVE_JOB_WORKER_MAX_PRIORITY`) and restart them with
`bin/restart-active-job-workers`.

Run `bundle exec ruby k8s/bin/verify-worker-priorities` to check Helm modes,
generated worker commands, and invalid values without a cluster or database.

## Active Job autoscaling (draft)

The chart can create a KEDA `ScaledObject` and `TriggerAuthentication` for the
worker Deployment. KEDA owns the resulting HPA. Dashboard autoscaling remains
independent. Autoscaling is disabled by default and does not install KEDA.

The initial staging override, to add to `k8s-gitops` after the prerequisites
below are deployed, is:

```yaml
activeJobWorker:
  priorityMode: low
  terminationGracePeriodSeconds: 2100
  autoscaling:
    enabled: true
    minReplicas: 1
    maxReplicas: 4
    jobsPerReplica: 1
    pollingInterval: 30
    connectionStringSecret:
      name: active-job-scaler-db
      key: connectionString
```

### Demand and scaling policy

The MySQL query counts nonfailed jobs whose `run_at` is due, restricted to the
worker's `priorityMode`. Locked rows remain in the count: claiming a job does
not remove demand. Future jobs and retained failures do not count. Before HPA
stabilization and rate limits, the desired count is approximately
`ceil(outstanding jobs / jobsPerReplica)`, bounded by the configured minimum
and maximum. One job per replica assumes the generated command's single worker
process per pod. Custom commands are rejected when autoscaling is enabled.

This count measures outstanding work, not worker occupancy. An abandoned lock
still contributes demand until the job is recovered or marked failed. Expired
locks remain counted because Delayed Job can reclaim them. Legacy workers
consuming the same priorities also contribute locked rows; finish the priority
split before treating this metric as Kubernetes-only demand. Do not override
worker priority limits through `locals.yml` or environment variables when using
autoscaling: the query is derived from `priorityMode` only.

Metrics are cached for the polling interval. The HPA may add one replica per
minute and remove one per minute after a five-minute stabilization window.
After repeated query errors, KEDA falls back to the greater of the current
replica count and the configured minimum. Alert on scaler errors; this fallback
cannot infer new demand during an outage. Scale-to-zero is deliberately excluded.

The worker keeps its configured shutdown grace period. Counting running jobs
does not ensure Kubernetes selects an idle pod for termination. A terminating
worker must finish its current job before the grace period expires; otherwise
its lock can delay recovery for four hours. The 2100-second staging setting
covers the known 30-minute job cap, not every possible Delayed Job runtime.
Terminating pods can also consume resources beyond the HPA maximum while their
replacements start. Allow for that overlap in node capacity planning.

### Infrastructure prerequisites

Install and pin a compatible KEDA release in `k8s-gitops` before enabling the
chart option. The draft uses the KEDA 2.18 API, including
`fallback.behavior: currentReplicasIfHigher` and cached MySQL metrics. Confirm
compatibility with the cluster's Kubernetes version and the selected KEDA
release. Keep the operator, metrics server, webhooks, and CRDs under the
infrastructure application's ownership, not this workload chart.

Provision the namespace-local Secret through External Secrets. Its
`connectionString` value must be a Go MySQL driver DSN, for example:

```text
scaler:PASSWORD@tcp(DB_HOST:3306)/dashboard_staging?tls=true&timeout=5s&readTimeout=5s&writeTimeout=5s
```

Use a dedicated account with SELECT access to `delayed_jobs` on the writer
endpoint; a read replica can lag the queue. Verify the database certificate
chain is trusted by the KEDA image. The Rails `db_writer` URL is not this DSN
format and must not be reused verbatim. Keep credentials out of Helm values.
KEDA needs network access to MySQL and access to this Secret; the application
pod's IRSA role does not provide database authentication to KEDA.

Run EXPLAIN for the generated COUNT query against representative queue sizes.
Check query latency and database load before choosing a polling interval or
adding an index. Monitor outstanding jobs and oldest eligible waiting-job age,
scaler errors, desired/ready/terminating replicas, and database load. The
existing ActiveJob metrics need priority filtering for this use.

### Replica ownership and rollout

When worker autoscaling is enabled, the Deployment omits `spec.replicas`.
Verify the Argo application does not restore that field during sync. If it
reports drift on HPA-owned replicas, configure an ignore rule scoped to this
Deployment's `/spec/replicas` with `RespectIgnoreDifferences=true`. Do not ignore
replicas across all Deployments. There must be only one HPA for the worker.

Enable staging first. Verify KEDA readiness, one idle worker, growth under a
low-priority backlog, and no growth from high-priority, future, or failed jobs.
Run a long job through scale-down and confirm completion without a forced kill.
Test an unavailable metrics source and a subsequent recovery. Sync Argo while
scaled above one replica and confirm the count is not reset. Review queue wait
time and database load before increasing the four-worker cap.

For rollback, disable autoscaling and set `activeJobWorker.replicas` explicitly.
Prune the ScaledObject and its owned HPA before reconciling the fixed count;
otherwise the controllers can temporarily compete. The chart does not restore
the replica count captured when the ScaledObject was created.

Local checks require Helm and the repository Ruby bundle:

```sh
bundle exec ruby k8s/bin/verify-worker-autoscaling
bundle exec ruby k8s/bin/verify-worker-priorities
```

These checks cover manifest rendering, not KEDA admission, database access, or
live scale-down. See the [MySQL scaler](https://keda.sh/docs/2.18/scalers/mysql/)
and [ScaledObject API](https://keda.sh/docs/2.18/reference/scaledobject-spec/).

## Non-local clusters

Argo CD and Kargo configuration lives in the
[`k8s-gitops`](https://github.com/code-dot-org/k8s-gitops) repository, normally
checked out beside this one. Kargo watches `ghcr.io/code-dot-org/cdo-rails` and
writes immutable image digests into the deployment values files.

See the
[`k8s-gitops` bootstrap guide](https://github.com/code-dot-org/k8s-gitops/blob/main/bootstrap/codeai-k8s/README.md)
for cluster creation and the
[`k8s-gitops` README](https://github.com/code-dot-org/k8s-gitops/blob/main/README.md)
for Argo CD deployment structure.

### AWS identity

Every pod the chart runs (worker, dashboard, one-shot jobs) uses the
ServiceAccount named by `serviceAccount.name`, `cdo-app` by default. The chart
creates it unless `serviceAccount.create` is false. The name is fixed rather
than derived from the release because the IAM trust policy spells it out as
`system:serviceaccount:<namespace>:cdo-app`; the chart assumes one release per
namespace.

On EKS the pods get AWS credentials through IAM Roles for Service Accounts
(IRSA). `k8s-gitops` creates one role per envType, `codeai-k8s-app-<envType>`,
with Crossplane, and sets `serviceAccount.annotations` in the envType values to
`eks.amazonaws.com/role-arn: <that role>`. The EKS pod identity webhook then
injects `AWS_ROLE_ARN`, `AWS_WEB_IDENTITY_TOKEN_FILE`, and `AWS_REGION` into
each container at admission, and the AWS SDK's default credential chain
assumes the role. IMDS stays disabled (`AWS_EC2_METADATA_DISABLED`), so a pod
without the annotation has no AWS credentials at all rather than the node's.

The annotation is read only when a pod is admitted, so the chart hashes
`serviceAccount.annotations` into the pod template; changing the role ARN rolls
the pods. The Kubernetes API token is not mounted (`automountServiceAccountToken:
false`); the webhook adds its own token volume for STS, independent of that
setting.

The role's policy lives in `k8s-gitops`
(`apps/infra/standard-envtypes/chart/templates/aws/`). It is the legacy
CloudFormation `CDOPolicy` minus what a worker never does, with S3 scoped to
named buckets. Jobs that need a new AWS permission change that policy, not the
chart.
