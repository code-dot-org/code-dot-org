# cdo-dev

The development image, layered on [cdo-gems](../gems/README.md). One image
with everything: build toolchain, Node, Playwright, debuggers, and the
development and test gems. Disk is cheap on a laptop, and "works in the
devcontainer" should mean one thing on every machine.

`.devcontainer/` holds the wiring that runs it — `devcontainer.json`, compose
services, the seeded database. This directory holds only the image.

## Why it stacks on cdo-gems

Two reasons, and the second one is the interesting one.

The gem tree arrives warm. cdo-gems installs the production groups; this image
clears `BUNDLE_WITHOUT` and `BUNDLE_DEPLOYMENT` and installs the 39 remaining
development and test gems as a delta. A lockfile bump costs that delta rather
than a cold install of the whole bundle.

More importantly, it fixes a dev/prod divergence. Exactly one gem is
production-only:

```ruby
gem 'mini_racer', group: [:staging, :test, :production, :levelbuilder]
```

`mini_racer` is the JS runtime. The previous devcontainer image excluded every
production group, so it had no mini_racer and ExecJS fell back to Node — its
Dockerfile installed Node with the comment *"Rails boot needs ExecJS
runtime."* Production runs in-process V8; development ran Node. Inheriting
cdo-gems makes local Rails evaluate JS the way production does, which is the
point of containerising the environment at all.

That exclusion looks like an arm64 accommodation rather than a choice:
`libv8-node` has no `aarch64-linux` build in the lockfile, so on Apple Silicon
mini_racer compiles V8 from source. See the arm64 note below.

## Build

Context is the repo root, not this directory, because the build reads
`uv.lock`, `pyproject.toml` and `python/`:

    docker build -f docker/dev/Dockerfile -t cdo-dev:test .

`GEMS_IMAGE` defaults to the published `cdo-gems:latest`. Override it to test
against a local gem layer:

    docker build -f docker/dev/Dockerfile \
      --build-arg GEMS_IMAGE=cdo-gems:local -t cdo-dev:test .

`BUNDLE_JOBS` defaults to the build machine's core count; set it to a number
only to throttle a memory-constrained build.

## No yarn cache warm, on purpose

The previous devcontainer image pre-installed every workspace's node_modules
so the first `yarn install` was local. That needs each workspace
`package.json` in the build context, and it cannot be expressed portably.

`frontend/` is 13 GB on disk against 24 MB tracked, so the context must be
filtered — and every ignore-file shape that reaches nested files diverges
between docker and podman. Measured, on `frontend/**/package.json` and again
on the single-star form: both engines build successfully and end up with
different file lists, with no error either way. Listing the files as explicit
`COPY` lines is portable but rots — the 17-line list this replaced had already
lost `frontend/packages/core/src/api/package.json`.

The cost is one network `yarn install` per repo volume, not per container
start, since the volume persists. If that becomes painful, the fix is a prep
step that assembles a small context, not a cleverer ignore file.

This is why `Dockerfile.dockerignore` here admits only whole top-level
entries: `docker/` and `python/` are small enough to take entire, which avoids
the nested-reinclusion question completely.

## amd64 only

Inherited from cdo-gems, which is amd64-only because `Gemfile.lock`'s
`PLATFORMS` has no `aarch64-linux`. On Apple Silicon this image runs under
`--platform linux/amd64` emulation: slower, but it works, so arm64 is a
rollout improvement rather than a blocker.

Making it native needs `bundle lock --add-platform aarch64-linux` plus
confirming every platform-specific gem in the lockfile publishes an aarch64
build. That is also what would let mini_racer be native on a Mac, so the two
are the same piece of work.

## mini_racer aborts at teardown under jemalloc

Because this image now has mini_racer, it inherits the abort documented in
[docker/gems/README.md](../gems/README.md): creating any V8 context makes the
process exit 139 with `free(): invalid pointer` at interpreter teardown, after
the JS has evaluated correctly.

Developers will see this where previously they could not, since they had no
mini_racer. That is the environment consistency working as intended — the
behaviour was always in production — but it will read as a broken devcontainer
the first time someone hits it, so it should be resolved rather than absorbed.

## Smoke test

    ./docker/dev/smoke-test.sh cdo-dev:test docker
    ./docker/dev/smoke-test.sh cdo-dev:test podman

The checks are in two halves: that the delta installed (the dev/test groups
resolve and load) and that nothing inherited was lost — mini_racer in
particular, since a mistake in the `BUNDLE_WITHOUT` handling would silently
drop it and reintroduce the Node fallback.

The script overrides `ENTRYPOINT` on every check. The image's entrypoint starts
sidecar services and expects a devcontainer around it.

## Dual-engine policy

Same rule and floor as cdo-base — one Dockerfile building on both Docker and
Podman, Podman >= 4.9 / buildah >= 1.33. No heredoc `RUN <<EOF`, no reliance
on `SHELL`, no `COPY --parents` / `COPY --link`. See
[docker/base/README.md](../base/README.md#dual-engine-policy).

The image this replaces used both heredocs and `SHELL ["/bin/bash", "-euxo",
"pipefail", "-c"]` throughout, so its `RUN` blocks are rewritten here as
explicit `set -eux` chains.
