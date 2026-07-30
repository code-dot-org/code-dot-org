# dashboard-devcontainer

## Why

Previous devcontainer attempts died on macOS bind-mount I/O and disk. The
numbers: 2.9G working tree, 27G `.git`, 2.8G `apps/node_modules`, 100k+ small
files — the pathological case for VirtioFS, which still runs ~3x slower than
native (2025 benchmarks). The current alternative — skaffold + Docker Desktop
k8s with source baked into a 10GB image — pays a ~3-min checksum on every
`skaffold dev`, forces containers to run as root for file sync
(skaffold#2479), and burns 1-2GB RAM on the k8s control plane alone, on 16GB
Apple Silicon laptops. Putting the workspace in a named volume removes the
bind-mount problem instead of mitigating it.

## What Changes

- New `.devcontainer/` whose `devcontainer.json` points at a **prebuilt** GHCR
  image (`"image":`), built from the `dev` target of `docker-rails-way-image`
  — dev and prod share base layers by construction.
- Workspace lives in a **named volume** ("Clone Repository in Container
  Volume" or scripted equivalent), cloned `--filter=blob:none`: native I/O,
  no host copy, neutralizes the 27G `.git`.
- CI prebuilds the image via the `devcontainers/ci` action, multi-arch
  (amd64+arm64) to GHCR, on the existing native-runner pattern
  (`.github/workflows/k8s-skaffold-build.yml`).
- Services via docker compose — mysql:8.0, redis:7.4, minio, same versions
  as `k8s/helm/templates/services/` — not Docker Desktop k8s.
- Lifecycle split: `onCreateCommand` = cacheable work baked into prebuilds
  (bundle/yarn hydration); `postCreateCommand` = per-developer work
  (locals.yml, DB restore — see `seeded-db-snapshot`).
- Inner-loop server is `bin/dashboard-server` (rerun hot reload) inside the
  container; skaffold sync stops being the app-dev hot-reload path, which
  eventually lets the root-user workaround die.
- Skaffold/k8s stays available for prod-parity work via
  `docker-outside-of-docker`, documented as secondary.
- arm64-native on Apple Silicon; no forced amd64/Rosetta.

## Capabilities

### New Capabilities

- `dashboard-devcontainer`: the contract for the prebuilt devcontainer —
  image lineage, workspace storage, services, lifecycle, first-run budget.

### Modified Capabilities

None (no existing specs).

## Impact

- New `.devcontainer/` directory (devcontainer.json, compose file, lifecycle
  scripts); new GH Actions prebuild workflow
- `SETUP.md` pointer to the devcontainer path
- Relates to future removal of the `skaffold.yaml` sync/root workaround
- Depends on `docker-rails-way-image` (`dev` target); pairs with
  `seeded-db-snapshot` for fast DB seeding
