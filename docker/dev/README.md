# cdo-dev

The development image, layered on [cdo-deps](../deps/README.md). One image
with everything: build toolchain, Node, Playwright, debuggers, and the
development and test gems. Disk is cheap on a laptop, and "works in the
devcontainer" should mean one thing on every machine.

`.devcontainer/` holds the wiring that runs it — `devcontainer.json`, compose
services, the seeded database. This directory holds only the image.

## Why it stacks on cdo-deps

The dependency tree arrives warm. cdo-deps installs the production gem
groups and the production venv; this image clears `BUNDLE_WITHOUT` and
`BUNDLE_DEPLOYMENT` and installs the remaining development and test gems as
a delta over the inherited tree, and re-syncs the venv with the dev group. A
lockfile bump costs the delta, not a cold install of the 1.3 GB bundle.

It also means dev and production resolve the same gem versions from the same
layer. Whatever production loads, the devcontainer loaded first.

It cannot stack on cdo-build, even though it duplicates cdo-build's
toolchain: the builder has to sit below the gem layer because it produces
it, and this image has to sit above it to inherit the warm tree.

## The source is a volume, so the image stays out of its way

Runtime flavors bake source; this image never does. The repo arrives as a
volume mounted over `/code-dot-org`, which shadows everything the parent
images baked there. Everything cdo-dev contributes therefore lives outside
the mount:

| what | where | why it survives the mount |
|---|---|---|
| gems | `/usr/local/bundle` | `BUNDLE_PATH`, outside the tree already |
| python venv | `/opt/venv` | `UV_PROJECT_ENVIRONMENT`; cdo-deps' baked `/code-dot-org/.venv` is shadowed |
| yarn | `/opt/corepack` | prepared by root, readable by all |
| browsers | `~/.cache/ms-playwright` | installed as the `cdo` user |

The venv's workspace members stay editable and point at
`/code-dot-org/python` — at runtime that is the mounted checkout's live
tree, which is exactly what a dev venv should track. `UV_NO_SYNC=0` turns
off the no-sync cdo-deps sets to keep an immutable image immutable, so a
plain `uv run` keeps `/opt/venv` current with the mounted lockfile. (It is
`0` rather than empty because uv, unlike bundler, rejects an empty boolean.)

## Build

The build reads nothing from the repo — lockfiles, engine gemspecs and
python project files are already in cdo-deps — so the context is this
directory, not the repo root:

    docker build -t cdo-dev:local docker/dev/

`DEPS_IMAGE` defaults to the published `cdo-deps:latest`. Override it to
build against a local dependency layer, or to pin by content key or digest
(see [the content key](../deps/README.md#the-content-key)):

    docker build --build-arg DEPS_IMAGE=cdo-deps:local -t cdo-dev:local docker/dev/

`BUNDLE_JOBS` defaults to the build machine's core count; set it to a number
only to throttle a memory-constrained build.

Because the delta installs against the lockfiles baked into cdo-deps, a dev
image is only as current as its parent. That is the same contract every
other consumer has: resolve cdo-deps by the checkout's content key, and a
key that does not resolve means the dependency layer for those lockfiles has
not been published yet.

## No yarn cache warm, on purpose

An earlier devcontainer image pre-installed every workspace's node_modules
so the first `yarn install` was local. That needs each workspace
`package.json` in the build context, and it cannot be expressed portably:
`frontend/` is 13 GB on disk against 24 MB tracked, so the context must be
filtered — and every ignore-file shape that reaches nested files diverges
between docker and podman, both builds succeeding with different file lists.
Listing the files as explicit `COPY` lines is portable but rots.

The cost is one network `yarn install` per repo volume, not per container
start, since the volume persists. If that becomes painful, the fix is a prep
step that assembles a small context, not a cleverer ignore file. Dropping
the warm cache is also what lets this build take no repo context at all.

## amd64 only

Inherited from cdo-deps, which is amd64-only because `Gemfile.lock`'s
`PLATFORMS` has no `aarch64-linux`. On Apple Silicon this image runs under
`--platform linux/amd64` emulation: slower, but it works, so arm64 is a
rollout improvement rather than a blocker. Making it native starts at
`bundle lock --add-platform aarch64-linux` in the dependency layer, not
here.

## Smoke test

    ./docker/dev/smoke-test.sh cdo-dev:test docker
    ./docker/dev/smoke-test.sh cdo-dev:test podman

The checks are in two halves: that the delta installed (the dev/test groups
resolve, the venv carries the dev group in `/opt/venv`) and that nothing
inherited was lost (the compiled extensions still load after the delta
install on top of them). Checks run through the image's entrypoint on
purpose: with no repo volume mounted every entrypoint stage is guarded off,
and the smoke test proves it degrades to a plain exec.

## Dual-engine policy

Same rule and floor as the rest of the family — one Dockerfile building on
both Docker and Podman, podman >= 4.9 / buildah >= 1.33. No heredoc
`RUN <<EOF`, no reliance on `SHELL`, no BuildKit-only COPY flags. See
[docker/base/README.md](../base/README.md).
