# docker-rails-way-image — design

## Context

Current state (branch `update-k8s-config-2`): five skaffold artifacts.
`code-dot-org-core` (2.67GB unpacked) compiles Ruby 3.2.11 with rbenv and
installs the union of dev and prod tooling; three `FROM scratch` content
layers (`static`, `pegasus`, `db-seed`); a final dockerfile that runs
bundle/uv/yarn stages and copies everything together (~10GB full,
~4GB for the activejob-only variant). CI builds amd64+arm64 on native runners
and stitches a multi-platform manifest to GHCR.

Reference conventions: the Rails generated Dockerfile
(`railties/.../Dockerfile.tt`), rubys/dockerfile-rails, Docker's Rails guide.
All build `FROM ruby:X-slim`, none compile Ruby, all use
base → build → final stages.

## Goals / Non-Goals

**Goals:**
- Slim, conventional image stages; prod ships no build toolchain.
- Cold build well inside 20-25 min on an M-series laptop, <10GB RAM.
- One Dockerfile lineage whose `dev` target can later back a devcontainer.

**Non-Goals:**
- Changing what the runtime image includes content-wise (curriculum, static,
  i18n layers) — that is `docker-thin-runtime`.
- Changing runtime commands, entrypoint, probes — that is `k8s-process-model`.
- Ruby version upgrade (3.2 → 3.4). Tracked as a risk, not done here.
- apps/ frontend build pipeline changes.

## Decisions

1. **Official `ruby:3.2.11-slim` over rbenv-compiled Ruby.** Prebuilt per-arch,
   maintained, ~80MB compressed one-time pull vs 5-15 min compile per cold
   build (worse under QEMU). rbenv's version switching is dead weight in a
   container with one Ruby. Alternative considered: Fullstaq Ruby images
   (prebuilt jemalloc variants) — viable later; official image keeps the
   change minimal.
2. **Debian slim, not Alpine, not distroless.** musl breaks precompiled gem
   binaries (nokogiri, grpc) and jemalloc was dropped from Alpine repos.
   Distroless Ruby (Chainguard) is CVE-count optimization, not size, and
   complicates debugging.
3. **Keep the five-artifact skaffold graph.** The scratch content layers and
   separate contexts are what keep skaffold change detection and caching sane
   for a repo this size. Only the *contents* of core change: it becomes
   `base`+`build`+`dev` stages instead of a fat monolith. Alternative
   (collapse to one Dockerfile with targets only) rejected: loses per-artifact
   context scoping and would force mimic and CI rework in the same change.
4. **jemalloc via LD_PRELOAD symlink in the Dockerfile** (Rails 8.1 pattern:
   `ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 ...` + `ENV
   LD_PRELOAD`), not entrypoint detection — works for `kubectl exec` shells
   too, matching the existing PATH-in-ENV rationale in core.
5. **Bundler config as ENV** (`BUNDLE_DEPLOYMENT`, `BUNDLE_WITHOUT`,
   `BUNDLE_PATH`) so it holds at build and runtime; per-profile overrides stay
   build args (the activejob-only profile already passes `BUNDLE_WITHOUT`).
6. **Non-root numeric USER.** Keeps k8s `runAsNonRoot` checks satisfiable.
   The skaffold-sync root workaround (skaffold#2479) stays confined to the
   dev profile until `dashboard-devcontainer` removes the need for sync.

## Risks / Trade-offs

- [Ruby 3.2 past upstream EOL; `ruby:3.2.11-slim` no longer rebuilt for CVEs]
  → pin by digest, schedule the 3.4 upgrade as follow-up; base swap makes that
  upgrade a one-line change.
- [Hidden runtime dependencies on removed tooling (e.g. something shells out
  to git or imagemagick CLI)] → boot-and-smoke CI job per target hitting
  `/health_check` plus a representative API before merging; keep runtime apt
  list additive as findings surface.
- [mimic drift: every COPY change must be mirrored in `k8s/mimic/`] → update
  mimic in the same commits; `skaffold build -p mimic` in CI validate job.
- [Bundler deployment mode changes local `bundle install` behavior if devs
  reuse the image] → dev target unsets `BUNDLE_DEPLOYMENT`.

## Migration Plan

Land behind the existing skaffold profiles: `runtime` becomes the default
deploy image for the activejob-only path first (already stubbed), then the
full path. Rollback = repoint helm `image:` at the previous tag; no data
migration involved.

## Open Questions

- zstd layer compression (`--output type=image,compression=zstd`): adopt now
  or after verifying all pull paths (Docker Desktop, EKS containerd, kind)
  accept zstd media types?
- Does anything in `lib/` require the AWS CLI binary at runtime (vs the SDK
  gems)? Determines whether awscli stays out of `runtime`.
