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
