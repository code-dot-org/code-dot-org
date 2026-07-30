# dashboard-devcontainer — design

## Context

Local dev today is skaffold + Docker Desktop k8s: source baked into a 10GB
image, `skaffold dev` re-checksums ~3 min per start, file sync runs the
container as root (skaffold#2479 workaround in `skaffold.yaml`), and the k8s
control plane holds 1-2GB RAM resident and doubles image storage. Dev
machines are 16GB Apple Silicon. Bind-mounting the repo instead is what
killed prior devcontainer attempts: 2.9G tree + 27G `.git` + 100k+ small
files over VirtioFS is ~3x slower than native and the small-file tree is the
worst case.

Prerequisite: `docker-rails-way-image` gives us a `dev` image target sharing
base layers with `runtime`. Reference conventions: the Rails 8 generated
devcontainer (compose services, lifecycle commands), VS Code "Clone
Repository in Container Volume", `devcontainers/ci` prebuilds.

## Goals / Non-Goals

**Goals:**
- Native-speed I/O on the workspace; no bind mount of the source tree.
- First dev experience (pull + clone + postCreate) inside 20-25 min.
- Fits in 16GB: Docker VM capped at 8GB, no k8s control plane resident.
- Same image lineage as production; one Dockerfile, one multi-arch manifest.

**Non-Goals:**
- Replacing skaffold/k8s for prod-parity work — it remains, as secondary.
- The `dev` image target itself — that is `docker-rails-way-image`.
- Fast DB seeding mechanics — that is `seeded-db-snapshot`.
- Migrating every developer; this lands opt-in.

## Decisions

1. **Workspace in a named volume, blobless clone.** This is the decisive
   call. Options for where the tree lives:

   | Option | I/O | Extra disk | Host-visible files | Cost |
   |---|---|---|---|---|
   | VirtioFS bind | ~1/3 native | none | yes | free |
   | Docker synchronized file shares | ~native | ~2x tree | yes | paid Docker tier |
   | OrbStack bind | 75-95% native | none | yes | $8/user/mo |
   | Named volume | native | 1x in VM | no | free |

   Named volume is the default: free, native-speed, and `git clone
   --filter=blob:none` inside the volume sidesteps the 27G `.git` entirely
   (no host copy exists to sync). OrbStack is an opt-in pilot for devs who
   need host-visible files; synchronized file shares only for those who
   require host visibility on stock Docker Desktop.
2. **Prebuilt image, not local Dockerfile build.** `devcontainer.json` uses
   `"image":` pointing at GHCR, built from the `dev` target of
   `docker-rails-way-image`. First-run cost becomes a pull, not a 20+ min
   local build, and dev/prod share base layers by construction. Alternative
   (local `"build":` from the same Dockerfile) rejected as the default:
   duplicates CI work per laptop and reopens the cold-build budget.
3. **Prebuild in CI via `devcontainers/ci`, multi-arch to GHCR.** The repo
   already runs native arm64+amd64 runners for
   `.github/workflows/k8s-skaffold-build.yml`; same pattern, no QEMU.
   Alternative (amd64-only + Rosetta) rejected: emulation tax on every
   process on Apple Silicon, the majority platform.
4. **Services via compose, not Docker Desktop k8s.** mysql:8.0, redis:7.4,
   minio at the versions pinned in `k8s/helm/templates/services/`. The inner
   loop needs three services, not a control plane costing 1-2GB RAM and 2x
   image storage. Rails 8's generated devcontainer does exactly this.
5. **Lifecycle split.** `onCreateCommand` does cacheable work that prebuilds
   bake in (bundle/yarn hydration against the committed lockfiles);
   `postCreateCommand` does per-developer work (locals.yml, DB restore via
   `seeded-db-snapshot`). Putting hydration in postCreate would forfeit the
   prebuild; putting per-dev secrets in onCreate would bake them into images.
6. **`bin/dashboard-server` is the inner-loop server.** It is a dev tool
   (rerun-based hot reload) and the container is its right home. Skaffold
   sync stops being the app-dev hot-reload path, which is what eventually
   lets the root-user sync workaround in `skaffold.yaml` die. Alternative
   (keep `skaffold dev` as the loop, devcontainer as editor shell only)
   rejected: keeps the 3-min checksum and root containers.
7. **Skaffold via `docker-outside-of-docker`, documented secondary.** The
   feature mounts the host docker socket, so prod-parity `skaffold build`
   /deploy still works from inside the container. Docker-in-docker rejected:
   duplicate image storage and known skaffold-inside-devcontainer failures
   (skaffold#9324).

## Risks / Trade-offs

- ["My code isn't on my Mac" — no host-visible files with a named volume]
  → document `docker cp`, VS Code volume browsing, and the OrbStack bind
  fallback; the editor lives in the container, so day-to-day work never
  notices.
- [Prebuilt image goes stale against Gemfile/yarn.lock churn] → prebuild on
  pushes to `staging`; `postCreateCommand` runs incremental
  `bundle install`/`yarn` so a stale image costs minutes, not correctness.
- [RAM pressure on 16GB machines] → cap the Docker VM at 8GB; compose
  services are small and no k8s control plane is resident.
- [Devcontainer drifts from production] → the image is a target of the same
  Dockerfile as `runtime` (`docker-rails-way-image`); one lineage, one
  multi-arch manifest, no second Dockerfile to rot.
- [skaffold misbehaves inside devcontainers (skaffold#9324)] → socket-based
  `docker-outside-of-docker`, skaffold documented as the secondary path with
  the known failure mode noted.

## Migration Plan

Lands opt-in beside the existing setup: `SETUP.md` gains a devcontainer
section, nothing else changes for current developers. Pilot with a few
volunteers on Apple Silicon; measure first-run wall clock against the 25-min
budget. Rollback for an individual = delete the container and volume; repo
rollback = remove `.devcontainer/` and the workflow. The `skaffold.yaml`
sync/root workaround is removed only after the devcontainer is the default
inner loop, in a separate change.

## Open Questions

- Prebuild cadence: every `staging` push, or nightly plus lockfile-change
  triggers? Depends on observed GHCR storage and Actions minutes.
- GHCR auth: is the prebuilt image public, or do external contributors need
  a PAT? Affects the documented first-run path.
- Where do UI tests (chromedriver) run in this world — inside the container
  against the compose services, or stay on the host for now?
