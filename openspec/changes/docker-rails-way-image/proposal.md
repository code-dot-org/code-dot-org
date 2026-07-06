# docker-rails-way-image

## Why

The k8s image hierarchy is inverted: every image derives from a dev-shaped
`code-dot-org-core` (ubuntu:22.04, rbenv-**compiled** Ruby, build-essential,
chromium, gdb, sauce-connect, oh-my-zsh), so production ships dev tooling and
every cold build spends ~5-15 minutes compiling Ruby. The Rails convention
(Rails 7.1+ generated Dockerfile) is the opposite: slim runtime base, throwaway
build stage, dev tooling added only in a dev target. Fixing the inversion is
what makes small images, fast builds, and a same-base devcontainer all
achievable at once.

## What Changes

- Replace `ubuntu:22.04` + rbenv/ruby-build with `ruby:3.2.11-slim` (official
  multi-arch image; pinned by digest since 3.2 is past upstream EOL).
- Restructure `k8s/docker/code-dot-org-core.dockerfile` and
  `code-dot-org.dockerfile` into explicit stages: `base` (runtime apt only) →
  `build` (compilers, bundle install, uv sync) → `runtime` → `dev`.
- Runtime stage adopts Rails-template bundler hygiene: `BUNDLE_DEPLOYMENT=1`,
  `BUNDLE_WITHOUT`, gem cache cleanup
  (`rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/cache .../bundler/gems/*/.git`).
- Enable jemalloc via `libjemalloc2` + arch-agnostic `LD_PRELOAD` symlink
  (Rails 8.1 mechanism; closes the existing `k8s/TODO.md` item).
- Move `bootsnap` out of the `:development` Gemfile group; precompile gems and
  app code at build time (`dashboard/config/boot.rb` already gates on presence).
- Runtime runs as non-root numeric `USER 1000:1000`.
- `dev` target carries the current core's toolchain (build-essential, node 20,
  chromium, zsh, awscli) and becomes the future devcontainer base.
- **BREAKING** for image consumers: `code-dot-org-core` stops being a
  fat dev image; anything that shelled into it expecting compilers/chromium
  must use the `dev` target.

## Capabilities

### New Capabilities

- `docker-image-targets`: the contract for what each image target (`base`,
  `build`, `runtime`, `dev`) contains, excludes, and guarantees.

### Modified Capabilities

None (no existing specs).

## Impact

- `k8s/docker/code-dot-org-core.dockerfile`, `k8s/docker/code-dot-org.dockerfile`
  and their `.dockerignore` files
- `skaffold.yaml` build args / targets; `k8s/mimic/` must track COPY changes
- `.github/workflows/k8s-skaffold-build.yml` (native multi-arch builds get
  faster; no ruby compile on either leg)
- `Gemfile` (bootsnap group move), `Gemfile.lock`
- Downstream: `docker-thin-runtime`, `k8s-process-model`, and
  `dashboard-devcontainer` proposals all build on these targets.
