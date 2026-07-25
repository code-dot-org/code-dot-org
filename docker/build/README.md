# cdo-build

The compile toolchain, layered on [cdo-base](../base/README.md). This image
compiles things; it never ships them. It carries no gems and no source tree.

Contents on top of cdo-base: `build-essential`, the dev headers the native
gems link against (`default-libmysqlclient-dev` for mysql2,
`libmagickwand-dev` for rmagick), `pkg-config`, `git` for the Gemfile's
git-sourced gems, `python3` for node-gyp, Node 20 with corepack for the
`apps/` build, and `uv` for the `python/` workspace. It runs as the non-root
`cdo` user with `BUNDLE_PATH=/usr/local/bundle` writable.

Derived from the `build` stage of `k8s/docker/code-dot-org.dockerfile` on
`feat/docker-thin`, with the same package set, rewritten for the dual-engine
rules below.

## Why it is its own image

It sits below the gem layer because it produces it — an image cannot be
built `FROM` an image containing its own output. cdo-gems compiles its
bundle here and copies the result onto cdo-base, so the shipped image
carries no toolchain.

That ordering is also why cdo-build and cdo-dev cannot be merged even though
their toolchains overlap: cdo-dev stacks *above* the gem layer to inherit
the warm gem cache, and the builder has to sit below it.

## Not published

Unlike cdo-base, this image is not pushed to a registry. It is materialized
during a build and discarded, so downstream Dockerfiles take it as a build
argument the way `k8s/docker/code-dot-org.dockerfile` already takes
`CODE_DOT_ORG_CORE`:

    docker build -t cdo-build:local docker/build/
    docker build --build-arg CDO_BUILD=cdo-build:local ...

The cost of not publishing is that a runner with no layer cache reinstalls
the toolchain (apt, nodesource, uv) per build — about 30 seconds. Registry
build cache covers it; if that stops holding, publishing this image is the
fix, and the smoke gate below already proves it builds standalone.

## Bundler and identity environment

cdo-base deliberately omits `BUNDLE_PATH`, `PATH`, and the
`UID`/`GID`/`SRC`/`USERNAME` exports so that it stays gem-agnostic and
usable by consumers with their own Gemfile, or none. cdo-build restores
them, which is what makes it a drop-in for `feat/docker-thin`'s `build`
stage.

Two notes for that migration:

- The user is `cdo` here, not `code-dot-org`. Anything keyed on the name —
  helm `values.yaml`, volume ownership — has to move with it.
- Downstream flavors that carry gems declare `BUNDLE_PATH` and `PATH` again
  for themselves. The gems are copied out of this image; the environment is
  not inherited, because those flavors build `FROM` cdo-base.

`${BUNDLE_PATH}/ruby/3.2.0` is pre-created and chowned so a consumer can
mount a BuildKit gem cache under it without root owning the parents. The
`3.2.0` component tracks `.ruby-version` and must be updated when Ruby is
bumped, or the mount silently stops caching.

## Base image pinning

`BASE_IMAGE` defaults to `ghcr.io/code-dot-org/cdo-base:latest`, so the
weekly cdo-base security rebuild is inherited. Override it with a digest
ref for byte-stable builds, or with a local tag to test an unpublished base
change:

    docker build --build-arg BASE_IMAGE=cdo-base:test -t cdo-build:test docker/build/

## Dual-engine policy

Same rule as cdo-base, and the same reasons: this one Dockerfile MUST build
on both Docker and Podman from the same source, floor Podman >= 4.9 /
buildah >= 1.33 (what Ubuntu 24.04 LTS and GitHub Actions runners ship). No
heredoc `RUN <<EOF`, no reliance on `SHELL`, no `COPY --parents` /
`COPY --link`. See [docker/base/README.md](../base/README.md#dual-engine-policy)
for what each of those breaks.

## Build

    docker build -t cdo-build:test docker/build/
    podman build -t cdo-build:test docker/build/

## Smoke test

    ./docker/build/smoke-test.sh cdo-build:test docker
    ./docker/build/smoke-test.sh cdo-build:test podman

The base contract (Ruby, jemalloc, MySQL client, ImageMagick, uid 1000) is
covered by `docker/base/smoke-test.sh`; this one asserts what cdo-build
adds. The two library checks compile and link a real translation unit
against libmysqlclient and libMagickWand rather than looking for header
files, because header layout is a packaging detail — ImageMagick 6 puts
`MagickWand.h` under a `wand/` subdir of two separate include paths, and a
path check that guesses wrong passes for the wrong reason.

Linking, not running, is the contract: the gems this image produces are
copied into a runtime image, so runtime `.so` lookup is cdo-base's contract.

## CI

`.github/workflows/cdo-build-image.yml` enforces the dual-engine policy on
every PR touching this directory: a 2x2 matrix builds and runs
smoke-test.sh with docker and podman on amd64 and arm64. There is no
publish leg, because there is no published image.
