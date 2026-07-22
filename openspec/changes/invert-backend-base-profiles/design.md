# Design: invert Skaffold profiles to backend-base + dashboard layer

## Context

Two parallel Skaffold configs drive the local container workflow and must
stay in sync (stated in both headers):

- `skaffold.yaml` (repo root): Helm deploy via `k8s/helm`.
- `k8s/kustomize/skaffold.yaml`: Kustomize deploy via
  `k8s/kustomize/overlays/skaffold`.

Both are structured full-app-first. The base build produces the `runtime`
image target with the complete frontend artifact chain
(`code-dot-org-core`, `-pegasus`, `-static`, `-db-seed`, plus `yarn build`),
and the base deploy renders the cdo-dashboard Deployment/Service/Ingress.
The `activejob-only` profile then subtracts:

- build: patches the build command to `--target runtime` with
  `SKIP_FRONTEND_BUILD=1` and a stripped `BUNDLE_WITHOUT` — still requiring
  all four artifact images even though none of the frontend output is used;
- deploy (Kustomize): `overlays/activejob-only` deletes the cdo-dashboard
  Deployment, Ingress, and Service with `$patch: delete` files and adds a
  `cdo-active-job-worker` Deployment;
- deploy (Helm): `activejob-only.values.yaml` sets `dashboard.enabled: false`
  and `activeJobWorker.enabled: true`.

The Dockerfile is already layered the right way: `code-dot-org-activejob-only`
and `runtime` both build FROM `base` (`code-dot-org-core`, ruby-slim), and
the activejob target needs only `code-dot-org-bundle-install` and
`code-dot-org-uv-sync` — not pegasus/static/db-seed.

Constraint discovered in review: `overlays/production` (and siblings
staging/test/levelbuilder) reference `../../base` and compose remote gitops
components (`code-dot-org/k8s-gitops//apps/codeai/envTypes/*`) that patch
resources by name. `verify-helm-parity` also depends on `base`'s rendered
shape. Whatever we do to `base` must not change what those consumers see.

## Goals / Non-Goals

**Goals:**

- Backend-only is the base layer in both Skaffold variants; the full
  dashboard is an additive layer. No `$patch: delete`, no
  `dashboard.enabled: false` subtraction files.
- Backend-only builds stop depending on the frontend artifact chain.
- `setup-db`, `setup-db-minimal`, `setup-s3`, `local-dev`, and `mimic`
  keep composing correctly.
- External consumers of `k8s/kustomize/base` (gitops envType components,
  verify-helm-parity) see an unchanged rendered result.

**Non-Goals:**

- Changing production/staging deploy pipelines (Kargo/Argo) themselves.
- Deciding Helm vs Kustomize; both variants are updated in lockstep.
- Splitting backend Rails APIs from the ActiveJob worker into separate
  images. One backend image serves both; which processes run is a manifest
  concern.
- Image size work beyond dropping the frontend chain from backend builds
  (the ruby-slim switch already landed).

## Decisions

### D1: Skaffold base config is backend-only; `dashboard` is a profile

The unpatched config in both skaffold.yaml files builds the backend image
and deploys backend manifests. A `dashboard` profile adds the frontend
artifact requirements, switches the image target, and adds the dashboard
manifests/values.

Profiles in Skaffold are patches on the base config, so the additive
direction must live in the profile. Today's shape (full base, subtractive
profile) is exactly what we are inverting; keeping full-as-base and adding a
second subtractive backend profile was rejected as more of the same drift.

### Implementation notes (discovered during apply)

- CI publishes the production image with a bare `skaffold build --push`
  (.github/workflows/k8s-skaffold-build.yml). With a backend-only base that
  would push a backend-only image to prod, so a `release` profile (full
  runtime image, production bundle flavor) now exists in both variants and
  CI passes `-p release`. The `dashboard` profile owns the dev-flavored
  full build; the old `development` profile no longer touches the build
  command (its replace would have clobbered the backend build under
  `-p -dashboard`).
- The worker's Helm render pins RAILS_ENV/extraEnv/resources/mounts via
  activeJobWorker values (per-include overrides in _dashboard.yaml), but
  deliberately keeps tracking `user.*` so skaffold's root override still
  reaches it for sync. Some gitops deployment values run the whole chart as
  root while their kustomize patch only targets cdo-dashboard, so
  verify-helm-parity gained a scoped accepted-drift rule for the worker's
  pod securityContext until the gitops follow-up adds a worker root patch.
- `active_job_queue_adapter: :delayed_job` lives in the shared locals
  ConfigMap (enqueuers need the same adapter as the worker); the
  boot-unblocking empty-secret overrides are worker-container env only, so
  the dev dashboard env is unchanged. Base render delta = worker Deployment
  + that one ConfigMap key.
- Fixed in passing: sprig `default` swallowed an explicit
  `healthChecksEnabled false` in _dashboard.yaml (worker would have gotten
  HTTP probes), and the setup-db kustomize Job lacked the imagePullPolicy
  Helm renders (pre-existing parity failure on this branch).
- verify-helm-parity stacks dashboard.values.yaml for every overlay (all
  render the dashboard) and gained a `backend` overlay entry checking the
  backend-only layer against Helm with `dashboard: false`.

### D2 (revised): `skaffold dev` is backend-only; the full app is explicit

    skaffold dev                # backend only (the base config, no profiles)
    skaffold dev -p dashboard   # full app, frontend build included

The first implementation auto-activated the `dashboard` profile on
dev/debug/docker-desktop to preserve `skaffold dev` muscle memory, with
`-p -dashboard` as the backend opt-out. Revised on review: the default now
matches the system's layering — the base config is what bare commands give
you, and every layer is an explicit opt-in. The muscle-memory break is
accepted deliberately; a bare `skaffold dev` comes up fast (no frontend
build) and the full-app invocation is one documented flag.

Consequences of dropping auto-activation:
- `mimic` and the `setup-db`/`setup-s3` flows assume the full artifact set
  or full image, so their documented invocations gain `-p dashboard`
  (e.g. `skaffold dev -p dashboard,mimic`). A bare `-p mimic` fails loudly
  on an invalid patch path rather than misbehaving.
- CI is unchanged: it was already explicit (`skaffold build -p release`).

`activejob-only` is removed as a profile name. Its documented invocation
(`skaffold dev --trigger=manual -p activejob-only -p setup-db-minimal`)
becomes `skaffold dev --trigger=manual -p setup-db-minimal`. A transitional
alias profile was considered and rejected — the whole point is to stop
maintaining a second spelling of backend-only.

### D3: Backend image = `--target code-dot-org-activejob-only`, requiring only core

The base build artifact for `code-dot-org` uses the Dockerfile's
existing backend target and `requires` only `code-dot-org-core`. The
`dashboard` profile patches the artifact to `--target runtime` and appends
`requires` entries (and build args) for `code-dot-org-pegasus`,
`code-dot-org-static`, `code-dot-org-db-seed`.

This is the payoff of the inversion: backend builds no longer pay for
pegasus/static/db-seed image builds at all, instead of building them and
throwing the output away via `SKIP_FRONTEND_BUILD=1`. If the
`code-dot-org-activejob-only` target proves too narrow for backend Rails
APIs (it currently mimics the runtime layout minus frontend), it may be
renamed to something like `backend` in the Dockerfile; rename is cosmetic
and can ride along.

The `IMPORT_IMAGE_TO_K8S_NODE=true` and `BUNDLE_JOBS=1` settings currently
buried in the activejob-only build command are re-evaluated: node-import
stays wherever the local cluster needs it (likely base), `BUNDLE_JOBS=1`
was a workaround and is dropped unless still needed.

### D4: Kustomize — split `base` internals into components, keep `base`'s output stable

Restructure:

    components/backend/     # locals.yml, cdo-local-secrets,
                            # cdo-active-job-worker Deployment
    components/dashboard/   # cdo-dashboard Deployment, Service, Ingress
    base/                   # composes backend + dashboard

- `base/` renders exactly what it renders now, plus exactly one deliberate
  addition: the `cdo-active-job-worker` Deployment. ActiveJob is the first
  piece of the full app's migration to Kubernetes, so the worker is a
  first-class base resource that server envTypes will configure — not a
  local-dev-only extra. Verify with `kustomize build` diff that the base
  and every env overlay change by that one added Deployment and nothing
  else; the remote gitops envType components patch resources by name, so an
  added Deployment must not collide, and production configuration of the
  worker (image, resources, replicas) lands in the k8s-gitops repo as
  follow-up work.
- New `overlays/backend/` composes `components/backend` + the service
  components (mysql/redis/minio) and the dev patches that apply to it —
  this is what the Skaffold base deploys.
- `overlays/development` (what the `dashboard` profile deploys) becomes
  backend + `components/dashboard` + its existing dashboard patches.
- `overlays/activejob-only` is deleted, including all four
  `$patch: delete` / config patch files; its locals overrides move into
  `components/backend` or a small backend-dev patch.

Alternative considered: physically move dashboard resources out of `base`
and add them back in env overlays. Rejected: it changes what env overlays
render for the dashboard and forces coordinated changes in the external
gitops repo. Alternative also considered: keep the worker Deployment out of
`base` (local overlay only) to preserve `base` byte-for-byte. Rejected per
the migration plan — ActiveJob-on-k8s is headed to production, so hiding
the worker from the base/envType path would just defer the same
coordination.

### D5: Helm — backend defaults in `values.yaml`, additive `dashboard.values.yaml`

`k8s/helm/values.yaml` defaults become backend-only:
`dashboard.enabled: false`, `activeJobWorker.enabled: true`, plus the
locals/env entries currently in `activejob-only.values.yaml`. A new
`dashboard.values.yaml` (stacked by the `dashboard` profile) sets
`dashboard.enabled: true`, `healthChecks.enabled: true`, and
dashboard-specific resources/locals. `activejob-only.values.yaml` is
deleted.

The `enabled` template flags remain — Helm has no resource composition
other than conditionals — but the *default* is backend, and the dashboard
layer only ever turns things on. That satisfies the "no subtraction files"
requirement. The helm chart is local-dev only (production uses the gitops
kustomize path), so flipping its defaults has no server blast radius.

### D6: `mimic` keeps working by index-stability or explicit targeting

The `mimic` profile patches `/build/artifacts/N/...` by index. With the
artifact list changing (base has fewer artifacts; `dashboard` adds some),
mimic composes with the `dashboard` profile explicitly
(`skaffold dev -p mimic` auto-activates dashboard via `command: dev`, so
indices are evaluated after the dashboard patches apply — verify profile
patch ordering, and if ordering is ambiguous, switch mimic to patch by
fixed positions of the post-dashboard artifact list or restructure mimic
to replace the whole `build.artifacts` array instead of index-patching).

## Risks / Trade-offs

- [Skaffold profile patch ordering: `dashboard` appending artifacts while
  `mimic`/others patch by index can mis-target] → Pin the profile
  application order in docs and comments; prefer whole-array `replace` in
  mimic; add a `skaffold diagnose`/`render` check for each documented
  profile combo before merge.
- [`base` rendered output changes beyond the intended worker addition,
  breaking gitops envTypes or verify-helm-parity] → Diff `kustomize build`
  of `base` and each env overlay before/after; the only acceptable delta is
  the added `cdo-active-job-worker` Deployment. Run `verify-helm-parity`
  and update its baseline for the worker.
- [Server environments render a worker Deployment before k8s-gitops
  configures it for production] → The worker's base spec must be safe when
  unconfigured (replicas default suited to local dev; envTypes scale/patch
  it); coordinate the k8s-gitops follow-up before any server rollout
  consumes the new base.
- [`-p -dashboard` is an unfamiliar CLI shape] → Document it in both
  skaffold.yaml headers and k8s docs; comments at each profile.
- [`code-dot-org-activejob-only` image target may lack something backend
  Rails APIs need (it was built for the worker)] → Backend API serving is
  exercised behind the same target before removing `SKIP_FRONTEND_BUILD`
  path from docs; the target keeps the dashboard/public symlink stubs.
- [Two skaffold variants drift during the refactor] → Change both files in
  the same commits; the header sync warning stays until Helm/Kustomize is
  decided.
- [Anyone with muscle memory for `-p activejob-only` gets an unknown-profile
  error] → Acceptable; the error is loud, and the rename is called out in
  file comments and the PR description.

## Migration Plan

1. Land the Kustomize component split with `base` output verified identical
   except the one deliberate addition (the `cdo-active-job-worker`
   Deployment).
2. Land the Skaffold inversion + Helm values flip + overlay/values file
   deletions in one PR (both variants together).
3. Validate: `skaffold render` for base, `-p -dashboard`, `dev` default,
   `mimic`, and setup-db/setup-s3 combos; boot backend-only and full
   dashboard locally.
4. Rollback: revert the PR; no persisted state depends on the layering
   (secrets/volumes are orthogonal).

## Open Questions

- Does the k8s-gitops repo ever consume `overlays/development`? If so its
  composition change needs a parity check too (assumed local-only today).
- Should the backend layer also start a Puma serving backend APIs now, or
  remain worker-only until an API-only use case lands? (Default: worker-only;
  the layering makes adding Puma a manifest change later.)
- What per-envType configuration does the production worker need in
  k8s-gitops (replicas, resources, queue selection), and does that repo
  need the worker Deployment name/labels stabilized before this lands?
