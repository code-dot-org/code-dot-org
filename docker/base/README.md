# cdo-base

Shared minimal base image for code-dot-org container flavors. Downstream
images (build stage, runtime-web, runtime-worker, dev, ci) layer on top of
this. The base carries runtime dependencies only: no build toolchain, no
Node, no gems, no source tree.

Contents: Ruby 3.2.11 (slim bookworm), the MySQL client + client libs,
ImageMagick, jemalloc (preloaded via `LD_PRELOAD`), curl, CA certs, locales,
and tzdata. Runs as the non-root `cdo` user (uid/gid 1000) with workdir
`/code-dot-org`.

## Dual-engine policy

This one Dockerfile MUST build on both Docker and Podman from the same
source. Do not fork per-engine files. Floor: Podman >= 4.9 / buildah >= 1.33
(what Ubuntu 24.04 LTS and GitHub Actions runners ship). Podman ignores
`# syntax=` frontend directives, so only features buildah supports natively
at that floor are allowed: cache mounts, `COPY --chown`/`--chmod`.

Known engine divergences, learned the hard way (the CI smoke test caught
both):

- No heredoc `RUN <<EOF` — podman 4.9's parser treats each heredoc line as
  a Dockerfile instruction.
- No reliance on `SHELL` — the OCI image format (podman's default) does not
  support it and podman silently ignores it, so `-e` semantics set via
  SHELL hold on docker but not podman. Use an explicit `set -eux` in each
  RUN instead.
- No `COPY --parents` / `COPY --link` (BuildKit frontend features).

## Build

    docker build -t cdo-base:test docker/base/
    podman build -t cdo-base:test docker/base/

## Smoke test

    ./docker/base/smoke-test.sh cdo-base:test docker
    ./docker/base/smoke-test.sh cdo-base:test podman

## CI and published image

`.github/workflows/cdo-base-image.yml` enforces the dual-engine policy on
every PR touching this directory: a 2x2 matrix builds and runs
smoke-test.sh with docker and podman on amd64 and arm64. On staging pushes
touching this directory and a weekly cron (security refresh of ruby-slim +
apt), it publishes a multi-platform image and deletes untagged package
versions (superseded buildcache manifests):

    ghcr.io/code-dot-org/cdo-base:latest
    ghcr.io/code-dot-org/cdo-base:git-<sha>
    ghcr.io/code-dot-org/cdo-base:<YYYY-MM-DD>

The date tag is the immutable name — the weekly cron rebuilds the same git
sha with different bytes. Consumers should pin by digest.
