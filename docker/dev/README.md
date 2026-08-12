# cdo-dev

This is the development image. It layers on [cdo-deps](../deps/README.md). It
is one image with everything: build toolchain, Node, Playwright, debuggers,
and the development and test gems. Disk is cheap on a laptop. "Works in the
devcontainer" should mean one thing on every machine.

`.devcontainer/` holds the wiring that runs it: `devcontainer.json`, the
compose services, and the seeded database. This directory holds the image
and `dev-bootstrap`. `dev-bootstrap` does the work a devcontainer needs
around the mounted source. It splits that work into two halves, the way the
lifecycle calls it: `create` once per container, and `start` on every
start. The image has no ENTRYPOINT. It runs bash.

## Why it stacks on cdo-deps

The dependency tree arrives warm. cdo-deps installs the production gem
groups and the production venv. This image clears `BUNDLE_WITHOUT` and
`BUNDLE_DEPLOYMENT`, then installs the remaining development and test gems
as a delta over the inherited tree. It also re-syncs the venv with the dev
group. A lockfile bump costs the delta, not a cold install of the whole
bundle.

It also means dev and production resolve the same gem versions from the same
layer. Whatever production loads, the devcontainer loaded first.

It cannot stack on cdo-build, even though it duplicates cdo-build's
toolchain. The builder has to sit below the gem layer, because it produces
that layer. This image has to sit above the gem layer instead, to inherit
the warm tree.

## The source is a volume, so the image stays out of its way

Runtime flavors bake source. This image never does. The repo arrives as a
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
`/code-dot-org/python`. At runtime that path is the mounted checkout's live
tree, which is what a dev venv must track. `UV_NO_SYNC=0` turns off the
no-sync that cdo-deps sets to keep an immutable image immutable. A plain
`uv run` therefore keeps `/opt/venv` current with the mounted lockfile. The
value is `0` and not empty, because uv rejects an empty boolean where
bundler accepts one.

## Build

The build reads nothing from the repo. Lockfiles, engine gemspecs, and
python project files are already in cdo-deps. The context is therefore this
directory, not the repo root:

    docker build -t cdo-dev:local docker/dev/

`DEPS_IMAGE` defaults to the published `cdo-deps:latest`. Override it to
build against a local dependency layer, or to pin by content key or digest
(see [the content key](../deps/README.md#the-content-key)):

    docker build --build-arg DEPS_IMAGE=cdo-deps:local -t cdo-dev:local docker/dev/

`BUNDLE_JOBS` defaults to the build machine's core count. Set it to a
number only to throttle a memory-constrained build.

Because the delta installs against the lockfiles baked into cdo-deps, a dev
image is only as current as its parent. That is the same contract every
other consumer has. Resolve cdo-deps by the checkout's content key. A key
that does not resolve means the dependency layer for those lockfiles has
not been published yet.

## No yarn cache warm, on purpose

An earlier devcontainer image pre-installed every workspace's node_modules
so the first `yarn install` was local. That needs each workspace
`package.json` in the build context. That cannot be expressed portably:
`frontend/` is far larger on disk than what git tracks, so the context must
be filtered. Every ignore-file shape that reaches nested files behaves
differently on docker and podman. Both builds then succeed with different
file lists. Explicit `COPY` lines for every file are portable. That
approach rots over time.

The cost is one network `yarn install` per repo volume, not per container
start, since the volume persists. If that becomes painful, the fix is a prep
step that assembles a small context, not a cleverer ignore file. Dropping
the warm cache is also what lets this build take no repo context at all.

## amd64 and arm64, natively

`Gemfile.lock` names both `x86_64-linux` and `aarch64-linux`. The whole
chain under this image therefore builds natively on both architectures. It
publishes as one multi-platform manifest. On Apple Silicon the devcontainer
runs native arm64, with no emulation. Three gems resolve to prebuilt
`aarch64-gnu` variants: ffi, google-protobuf, and nokogiri. Everything else
compiles from source in cdo-build, the same way on both architectures.

## Smoke test

    ./docker/dev/smoke-test.sh cdo-dev:test docker
    ./docker/dev/smoke-test.sh cdo-dev:test podman

The checks are in three groups. First, the delta installed. The dev/test
groups resolve, and the venv carries the dev group in `/opt/venv`. Second,
nothing inherited was lost. The compiled extensions still load after the
delta installed on top of them. Third, `dev-bootstrap` is installed and
runnable.

## Dual-engine policy

This follows the same rule and floor as the rest of the family. One
Dockerfile builds on both Docker and Podman, podman >= 4.9 and buildah >=
1.33. It uses no heredoc `RUN <<EOF`, no reliance on `SHELL`, and no
BuildKit-only COPY flags. See [docker/base/README.md](../base/README.md).
