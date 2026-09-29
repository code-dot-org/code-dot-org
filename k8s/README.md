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

The root [`skaffold.yaml`](../skaffold.yaml) deploys the Helm chart. The sibling
[`k8s/kustomize/skaffold.yaml`](kustomize/skaffold.yaml) exists while Helm and
Kustomize parity is under evaluation; keep their build graphs equal.

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

For Kustomize, add one priority component after the backend component in the
environment overlay:

```yaml
components:
  - ../../components/backend
  - ../../components/active-job-worker-low
```

Use `active-job-worker-high` for high priorities. Include neither priority
component for both; do not include both priority components in one overlay.

During migration, Kubernetes can start with `low` while existing workers
continue consuming both priorities. To move all low-priority work to Kubernetes,
the existing workers must also be configured to consume only high priorities.

Run `bundle exec ruby k8s/bin/verify-worker-priorities` to check Helm modes,
invalid values, and Kustomize command parity without a cluster or database.

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
