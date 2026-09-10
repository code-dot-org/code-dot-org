---
title: Delivery
description: How a commit reaches production -- branches, Drone, GitHub Actions, Chef/EC2, the k8s path, adhoc environments, and DTS.
type: concept
---

Code moves from a pull request to production through a fixed branch pipeline, CI gates, and Chef-managed deploys.

## Branch model

Four long-lived branches track the deploy pipeline:

| Branch | Purpose |
|---|---|
| `staging` | The main branch. PRs merge here. Squash-merge; the PR title is the commit that lands. |
| `levelbuilder` | Curriculum content. Curriculum authors commit here; a cron job (`commit_content`) pushes changes, and `merge_lb_to_staging` (DTS) merges them into staging on weekdays. |
| `test` | The test environment. `deploy_to_test` runs every 2 minutes on the test daemon. |
| `production` | The production environment. Deploys are gated. |

### DTS (deploy-to-staging)

DTS is the daily merge of `levelbuilder` content into `staging`. A cron job on the staging daemon creates a `dts_candidate_<date>` branch, merges `levelbuilder` into it, and opens a PR. The merge runs at 07:35 UTC on weekdays. The `robo-commit` tag on these merges marks them as automated.

`update_dts` runs every minute on the staging daemon to keep the DTS candidate current. `deploy_to_levelbuilder` runs at 09:20 UTC to push staging back to levelbuilder.

## CI pipelines

### Drone

Every PR push triggers Drone at `https://drone.cdn-code.org`. Three pipelines:

- **`unit`** -- restores a cached staging build, checks out the PR branch, runs Ruby lint, dashboard minitest, `apps/yarn test`, shared/lib tests, and pegasus tests. Services: Redis and MySQL 8.0.
- **`ui`** -- runs Cucumber UI and Eyes tests against a freshly-built instance.
- **`cache-staging-build`** -- builds and caches the staging artifact for the other pipelines.

A run takes 30-60 minutes. The `@no_ci` tag skips a Cucumber feature under Drone.

### GitHub Actions

`Frontend-CI` runs on PRs and pushes to `staging` when `frontend/` or `.github/` files change. It delegates to per-package `workflow_call` jobs (Studio-CI, Component-Library-CI, Oceans-CI, Markdown-CI, Users-CI, Lesson-Deep-Dive-CI, E2E-Tests-CI) that run only when their files changed. A `paths-filter` step computes the change sets.

Other notable workflows:

- `k8s` -- validates Kubernetes manifests on PRs touching `k8s/`.
- `cdo-base-image`, `cdo-deps-image`, `cdo-rails-image` -- build Docker images on pushes and schedules.
- `DTT` (`dtt.yml`) -- a `workflow_dispatch` workflow that deploys to the test environment and runs both Cucumber and Playwright suites against it.
- `pr_check_for_manual_deploy_requirement` -- flags PRs that need a manual deploy step.

### Build hooks

`DevController` exposes `/api/dev/start-build` and `/api/dev/check-dts`, guarded by `rack_env?(:staging, :test)`. `start_build` additionally returns 403 in development and production. These are called by CI, not by engineers.

## Infrastructure: Chef and EC2 today

Production runs on EC2 instances managed by Chef cookbooks (`cookbooks/`, 23 top-level directories) and provisioned by CloudFormation templates (`aws/cloudformation/`, 31 files). The `cdo-apps` cookbook's `crontab.erb` runs all scheduled jobs on the daemon instance.

The daemon is the single instance per environment that runs cron jobs. In production, that instance runs roughly 30 cron jobs covering email delivery, PD workshops, data pipelines, contact rollups, cleanup, and monitoring. Staging and test daemons run deploy and content-sync jobs. See [Background jobs](/developers/platform/background-jobs/) for the ActiveJob and crontab details.

A deploy updates the CloudFormation stack, which triggers Chef convergence on each instance. The `ci_build` cron job runs every minute on daemons, pulling changes and running `bundle exec rake infra:ci`.

## Infrastructure: Kubernetes (pre-production)

A Kubernetes deploy path exists alongside Chef/EC2. It uses Skaffold for local dev (`skaffold dev -p dashboard`) and ArgoCD for cluster sync from the `k8s-gitops` repo.

Key concepts:

- `env_type` (staging, test, production, levelbuilder, adhoc) controls the namespace and secret access.
- `release_name` (matches the CloudFormation `stack_name` and Helm release) controls instance identity.

The k8s manifests live in `k8s/`, Docker images in `docker/`, and the Skaffold config in `skaffold.yaml`. Both `k8s/README.md` and `docker/README.md` warn that this path is early-stage. No file in the repo states that Kubernetes serves live production traffic.

## Adhoc environments

Adhoc instances are throwaway preview environments for testing a branch. `bin/deploy-adhoc` provisions one. `bin/cron/stop_inactive_adhoc_instances` stops idle adhocs weekly (Saturdays at 07:00 UTC on the production daemon).

The `adhoc` Rails environment (`dashboard/config/environments/adhoc.rb`) is a near-copy of development with some production-like behavior. CanCanCan renders full stack traces in adhoc (and development), unlike production. Seed data uses `ADHOC_SEED_TASKS`, a last-year-only curriculum subset for faster boot.

For building frontend assets on an adhoc, see [build-assets-on-adhoc.md](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/build-assets-on-adhoc.md) (note: references to PhantomJS in that document are stale).

## Next steps

- [Logs and observability](/developers/operations/logs-and-observability/) -- finding what went wrong after a deploy.
- [Platform: background jobs](/developers/platform/background-jobs/) -- the crontab and ActiveJob details.
- [Testing](/developers/operations/testing/) -- what the CI pipelines actually run.
