# cdo-build

The compile toolchain, layered on [cdo-base](../base/README.md). This image
compiles things; it never ships them. It carries no gems and no source tree.

Contents on top of cdo-base:

- `build-essential` and `pkg-config`
- `default-libmysqlclient-dev`, for the mysql2 extension
- `libmagickwand-dev`, for rmagick
- `git`, for the Gemfile's git-sourced gems
- `python3`, for node-gyp
- Node 20 with corepack, for the `apps/` build
- `uv`, for the `python/` workspace

It runs as the non-root `cdo` user with `BUNDLE_PATH=/usr/local/bundle`
writable.

This is the canonical build toolchain for local containers and deployed image
publishing. The dual-engine rules below keep Docker and Podman builds equal.

## Why it is its own image

It sits below the gem layer because it produces it — an image cannot be
built `FROM` an image containing its own output. cdo-deps compiles its
bundle here and copies the result onto cdo-base, so the shipped image
carries no toolchain.

That ordering is also why cdo-build and cdo-dev cannot be merged even though
their toolchains overlap: cdo-dev stacks *above* the gem layer to inherit
the warm gem cache, and the builder has to sit below it.

## Not published

Unlike cdo-base, this image is not pushed to a registry. It is materialized
during a build and discarded, so cdo-deps takes it as the `BUILD_IMAGE` build
argument:

```sh
docker build -t cdo-build:local docker/build/
docker build -f docker/deps/Dockerfile --build-arg BUILD_IMAGE=cdo-build:local ...
```

The cost of not publishing is that a runner with no layer cache reinstalls
the toolchain (apt, Node, uv) per build — about 30 seconds. Registry
build cache covers it; if that stops holding, publishing this image is the
fix, and the smoke gate below already proves it builds standalone.

## Where node comes from

Node is the release tarball from `nodejs.org`, verified against the Node.js
release team's keyring: `gpgv` checks the releaser's PGP signature over
`SHASUMS256.txt`, and that file's digest is then checked against the tarball.
This is the mechanism the official `docker-library/node` image uses and the one
`nodejs/node` documents under "Verifying binaries". Trust terminates at the
Node.js project — there is no vendor convenience script, and nothing is piped
from the network into a shell. It also costs no packages: `gpgv` comes with
`ruby-slim`, and `.tar.gz` needs only gzip, so the step does not depend on
`xz-utils` — which is absent from cdo-base and reaches this image only as a
transitive dependency of `build-essential`.

`gpgv` prints `not a detached signature ... was NOT verified` on a clearsigned
file. That warning is cosmetic; the `Good signature` line and the exit status
are the check.

Node 20 reached EOL on 2026-04-30, so `20.20.2` is terminal. Moving to a
supported major is a repo-wide change — chef, CI, cdo-dev, the `apps/`
toolchain — not a bump here.

No yarn version is pinned. corepack reads it from each project's
`package.json` `packageManager` field at use time, and the smoke test asserts
whatever `apps/package.json` pins.

## Updating node

Edit `NODE_VERSION`. If `gpgv` then fails with an unknown key, the release was
signed by a newer releaser, so advance `NODE_KEYS_REF` to the current
[nodejs/release-keys](https://github.com/nodejs/release-keys) commit — that
repository has no tags, which is why it is pinned by commit. Those two tokens
are the only version-sensitive material in the mechanism.

The smoke test pins the image's Node major to the repo's `.nvmrc`, so a major
moved here without the repo-wide pins (`.nvmrc`, chef's `cdo-nodejs`, `apps/`
engines) fails at the gate instead of shipping skew.

## Where uv comes from

uv comes from Astral's own registry image, copied in with `COPY --from`, the
primary method in [their Docker
guide](https://docs.astral.sh/uv/guides/integration/docker/). It is pinned by
tag *and* digest, so the reference cannot move even if the tag is republished,
and it is written out on the `FROM` line rather than assembled from an `ARG`:
dependabot reads `FROM` lines and cannot resolve `ARG`s, so a literal is what
gets bumped (`.github/dependabot.yml` globs `/docker/*`, so new images need no
edit there). That limitation is why `NODE_VERSION` and `NODE_KEYS_REF` are
bumped by hand.

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

`${BUNDLE_PATH}/ruby/<abi>` is pre-created and chowned so a consumer can
mount a BuildKit gem cache under it without root owning the parents. The ABI
component is asked of the interpreter in the image
(`RbConfig::CONFIG["ruby_version"]`) rather than transcribed from
`.ruby-version`, so a Ruby bump needs no edit here. The one place in the family
that cannot derive it is cdo-deps' cache-mount target, where a guard line makes
a mismatch a loud failure; see
[docker/deps/README.md](../deps/README.md#build).

## Base image pinning

`BASE_IMAGE` defaults to `ghcr.io/code-dot-org/cdo-base:latest`, so the
weekly cdo-base security rebuild is inherited. Override it with a digest
ref for byte-stable builds, or with a local tag to test an unpublished base
change:

```sh
docker build --build-arg BASE_IMAGE=cdo-base:test -t cdo-build:test docker/build/
```

## Dual-engine policy

Same rule as cdo-base, and the same reasons: this one Dockerfile MUST build
on both Docker and Podman from the same source, floor Podman >= 4.9 /
buildah >= 1.33 (what Ubuntu 24.04 LTS and GitHub Actions runners ship). No
heredoc `RUN <<EOF`, no reliance on `SHELL`, no `COPY --parents` /
`COPY --link`. See [docker/base/README.md](../base/README.md#dual-engine-policy)
for what each of those breaks.

## Build

```sh
docker build -t cdo-build:test docker/build/
podman build -t cdo-build:test docker/build/
```

## Smoke test

```sh
./docker/build/smoke-test.sh cdo-build:test docker
./docker/build/smoke-test.sh cdo-build:test podman
```

Run it from the repo root: it reads the Node major from `.nvmrc` and the yarn
version from `apps/package.json` rather than hardcoding either. The yarn check
needs network, since corepack downloads yarn on demand.

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

This image has no workflow of its own. `.github/workflows/cdo-deps-image.yml`
is the gate for this directory: its trigger paths include `docker/build/**`,
and every job in it builds cdo-build and runs this smoke test before building
the gem layer, on both docker and podman. A separate workflow would build the
same image twice per PR to assert the same contract.

The deps workflow doubles as this image's canary. It is chained off
`cdo-base-image` by `workflow_run`, so every successful base publish — including
the weekly cron rebuild — rebuilds and smoke-tests this toolchain against the
fresh base, and a base change that breaks it surfaces without waiting for a
lockfile change. A failed base run triggers nothing, so the canary never fires
against a base already known to be broken.
