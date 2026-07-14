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
source. Do not fork per-engine files. Floor: Podman >= 5.4 / buildah >= 1.38.
Use only features buildah supports natively — heredoc `RUN`, cache mounts,
`COPY --chown`/`--chmod`. Podman ignores `# syntax=` frontend directives, so
avoid anything that needs a BuildKit-only frontend (`COPY --parents`,
`COPY --link`).

## Build

    docker build -t cdo-base:test docker/base/
    podman build -t cdo-base:test docker/base/

## Smoke test

    ./docker/base/smoke-test.sh cdo-base:test docker
    ./docker/base/smoke-test.sh cdo-base:test podman

## CI and published image

`.github/workflows/cdo-base-image.yml` enforces the dual-engine policy on
every PR touching this directory: a 2x2 gate builds and smoke-tests with
docker and podman on amd64 and arm64. On staging pushes and a weekly cron
(security refresh of ruby-slim + apt), it publishes a multi-platform image:

    ghcr.io/code-dot-org/cdo-base:latest
    ghcr.io/code-dot-org/cdo-base:git-<sha>
    ghcr.io/code-dot-org/cdo-base:<YYYY-MM-DD>

The date tag is the immutable name — the weekly cron rebuilds the same git
sha with different bytes. Consumers should pin by digest.
