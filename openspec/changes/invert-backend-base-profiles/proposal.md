# Invert Skaffold profiles: backend-only base, full dashboard on top

## Why

The local container workflow (Skaffold + the multi-stage
k8s/docker/code-dot-org.dockerfile) is moving toward a modular model: start
from a small ruby-slim base and add layers only as a deployment needs them —
backend-only (ActiveJob workers and/or backend Rails APIs) at the bottom,
full frontend + dashboard on top. The Dockerfile already has this shape
(`code-dot-org-activejob-only` and `runtime` targets both build FROM `base`).
The Skaffold configuration does not: the default profile builds and deploys
the entire Rails app, and the `activejob-only` profile works by subtraction —
it patches the full build command and, in the Kustomize variant, deletes the
cdo-dashboard Deployment, Service, and Ingress that the base manifests just
created. Every future backend-only variant would have to repeat this
delete-what-you-don't-want dance, and the deletion patches silently drift
whenever the base manifests change.

## What Changes

- Invert the profile layering in both Skaffold configs (`skaffold.yaml` and
  `k8s/kustomize/skaffold.yaml`, which must stay in sync per their headers):
  the default build/deploy unit becomes backend-only; the full dashboard is
  an additive profile on top of it, not the other way around.
- **BREAKING** (local dev workflow only): plain `skaffold dev` now deploys
  the backend-only base; the full-dashboard experience moves behind the
  explicit `dashboard` profile (`skaffold dev -p dashboard`), and
  `activejob-only` is removed in favor of the base. Invocations documented
  in README/comments are updated accordingly.
- Restructure the Kustomize tree so backend-only resources (locals, secrets,
  services, ActiveJob worker) live in the base layer and the cdo-dashboard
  Deployment/Service/Ingress are added by a dashboard overlay, eliminating
  the `$patch: delete` files in `overlays/activejob-only`.
- Restructure the Helm values equivalently: backend-only defaults with a
  dashboard values layer that enables the frontend deployment, replacing
  `activejob-only.values.yaml`'s role as a subtraction layer
  (`dashboard.enabled: false`).
- Align the build pipeline with the layering: the backend-only build path
  must not require the frontend artifact chain (`code-dot-org-static`,
  `code-dot-org-yarn-build` via `--target runtime` + `SKIP_FRONTEND_BUILD`);
  the full profile adds those artifacts and the `runtime` target.

## Capabilities

### New Capabilities

- `skaffold-backend-base`: the default Skaffold build/deploy unit is a
  backend-only deployment — small image, no frontend build, ActiveJob worker
  and/or backend Rails APIs — expressed as base config, not as deletions from
  a fuller config.
- `skaffold-dashboard-profile`: an additive profile that layers the frontend
  build and the cdo-dashboard Deployment/Service/Ingress on top of the
  backend base to deploy the full Rails app.

### Modified Capabilities

<!-- none: no existing specs in openspec/specs/ -->

## Impact

- `skaffold.yaml` (repo root, Helm variant): profile definitions, default
  build command, `activejob-only` profile.
- `k8s/kustomize/skaffold.yaml`: same inversion for the Kustomize variant.
- `k8s/kustomize/base/`, `k8s/kustomize/overlays/development/`,
  `k8s/kustomize/overlays/activejob-only/` (delete patches removed),
  `k8s/kustomize/overlays/skaffold*/`: resource layering moves.
- `k8s/helm/values.yaml`, `k8s/helm/activejob-only.values.yaml`,
  `k8s/helm/development.values.yaml`: values layering moves.
- `k8s/docker/code-dot-org.dockerfile`: mostly already structured for this;
  may need the backend-only target wired as the base profile's build target.
- Downstream profiles that compose with these (`setup-db`, `setup-db-minimal`,
  `setup-s3`, `mimic`, `local-dev`) must keep working against the new
  layering.
- Docs/comments describing `skaffold dev` and `-p activejob-only` usage.
- k8s-gitops repo (follow-up, not this change): per-envType configuration
  of the ActiveJob worker Deployment, which becomes a shared base resource
  as the first stage of the production Kubernetes migration.
