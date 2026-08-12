# cdo-deps

The dependency layer: `cdo-base` plus the production Ruby bundle and the
Python virtualenv. It carries no source tree and no compile toolchain — the
gems and the venv are built in `cdo-build` and copied onto `cdo-base`, so the
compilers, headers, Node, and git that produced them do not ship.

`cdo-rails` stacks on it: `FROM cdo-deps` plus the Rails source slice.

Contents:

- the bundle for the `default` group and every group except `development` and
  `test`, installed under `/usr/local/bundle`
- the lockfiles and engine gemspecs Bundler needs to resolve that bundle at
  runtime: `.ruby-version`, `Gemfile`, `Gemfile.lock`, `dashboard/engines`
- `/code-dot-org/.venv`, the interpreter uv manages for it under
  `$HOME/.local/share/uv`, the `uv` binary, and the project files `uv run`
  resolves the venv through: `.python-version`, `pyproject.toml`, `uv.lock`,
  and `python/`

`uv` is the one build-time tool that stays. Rails boot requires `cdo/pycall`,
which shells out to `uv run` to locate the venv's interpreter and its
site-packages, so the runtime needs it.

`python/` ships because the workspace members are installed editable: the venv
points into that tree. A source flavor overlays its own checkout's copy on
top, so a `.py` change rides the source layer and does not move this image's
content key.

## Build

The build context is the repo root, and the Dockerfile is selected with `-f`.
`BUILD_IMAGE` has no default because `cdo-build` is never published — build it
first and name it:

```
docker build -t cdo-build:test docker/build/
docker build -f docker/deps/Dockerfile \
  --build-arg BUILD_IMAGE=cdo-build:test \
  -t cdo-deps:test .
```

Podman takes the same two commands with `podman` substituted. `BASE_IMAGE`
defaults to `ghcr.io/code-dot-org/cdo-base:latest`; pass a digest reference to
pin it.

`--build-arg BUNDLE_JOBS=<n>` throttles `bundle install` parallelism. Empty
(the default) means one job per core, which is also the peak-memory case.

The final stage runs `bundle check` and imports `pycdo`, so a bad copy between
stages fails the build rather than the first boot.

## Smoke test

```
./docker/deps/smoke-test.sh cdo-deps:test docker
./docker/deps/smoke-test.sh cdo-deps:test podman
```

It asserts the bundle resolves and activates, that the native extensions built
in `cdo-build` load against `cdo-base`'s libraries (mysql2, rmagick,
nokogiri), that the venv imports offline, that no compiler or Node came along,
and that the environment below is exported. The `cdo-base` contract itself is
covered by `docker/base/smoke-test.sh`; see
[docker/base/README.md](../base/README.md).

## Environment the image exports

| variable | value | why it must stay set |
|---|---|---|
| `BUNDLE_PATH` | `/usr/local/bundle` | where the bundle lives |
| `BUNDLE_DEPLOYMENT` | `1` | frozen lockfile; a drifted `Gemfile` fails loudly |
| `BUNDLE_WITHOUT` | `development:test` | without it `Bundler.setup` tries to activate groups that were never installed |
| `UV_NO_SYNC` | `1` | without it `uv run` re-syncs at runtime, including dev groups, into an image that should be immutable |

Gem executables are not on `PATH`. Bare `rake` resolves to the base image's
copy; `bundle exec rake` resolves the locked one. Go through `bundle exec`.

## Build context

`Dockerfile.dockerignore` is an allowlist: deny everything, then re-include
exactly what Bundler and uv need. Both docker and buildah honour the
`<dockerfile>.dockerignore` naming convention and fail the build when a COPY
names an excluded path.

Engine gemspecs and their `version.rb` files are allowed in and COPYed
individually, not as a tree, so that engine source changes do not invalidate
`bundle install`. Adding an engine to the `Gemfile` therefore needs the
gemspec COPY, the `version.rb` COPY, and — if the paths do not match the
existing `dashboard/engines/*/...` patterns — a dockerignore rule. Missing
them fails the build under frozen mode.

Re-including a nested path requires un-excluding its parents, which is why the
dashboard rules read as a three-step: allow the directory, drop its contents,
allow `engines`.

## The content key

Consumers do not resolve this image by branch or by date. They resolve it by a
content key computed from the inputs that decide what lands in the layer:

```
.ruby-version
Gemfile
Gemfile.lock
.python-version
pyproject.toml
uv.lock
docker/build/Dockerfile
docker/deps/Dockerfile
```

The key is `bundle-<sha256>` over the concatenated *contents* of those files in
that order. File names are not hashed, so renaming an input does not move the
key. `Gemfile` is in the list even though `Gemfile.lock` is: moving a gem
between groups can leave the lockfile byte-identical while changing what
`BUNDLE_WITHOUT` installs.

`.github/actions/cdo-deps-key` is the one implementation. Consume it rather
than recomputing the list:

```yaml
- id: key
  uses: ./.github/actions/cdo-deps-key
- run: docker pull ghcr.io/code-dot-org/cdo-deps:${{ steps.key.outputs.key }}
```

The action fails, naming the file, if any input is missing from the checkout —
a sparse checkout that omits one would otherwise hash to a key that fails far
away with no explanation.

A checkout whose dependency inputs have never been published has no keyed
image. That is the intended failure: the layer is published on the staging
push that changes a lockfile, so a consumer branch must be rebased onto that
push rather than silently landing on stale bytes.

To see which key a checkout implies — to pull the matching layer, or to work
out why a keyed tag did not resolve — reproduce it in a shell:

```
key="bundle-$(cat .ruby-version Gemfile Gemfile.lock .python-version \
  pyproject.toml uv.lock docker/build/Dockerfile docker/deps/Dockerfile \
  | sha256sum | cut -d' ' -f1)"
echo "$key"
```

## Published image

Published as `ghcr.io/code-dot-org/cdo-deps`.

| tag | published from | meaning |
|---|---|---|
| `bundle-<hash>` | staging | the content key above; the tag consumers resolve |
| `git-<sha>` | staging | the commit that published |
| `latest` | staging | most recent staging publish |
| `dev-<sha>` | other branches | manual dispatch |

Each tag is a multi-platform manifest over amd64 and arm64: the lockfile
names both `x86_64-linux` and `aarch64-linux`, each architecture builds
natively in CI, and the per-arch pushes (`<tag>-amd64`, `<tag>-arm64`) are
stitched under the final name — the cdo-base pattern. Pin by digest: resolve
the `bundle-<hash>` tag to a digest once and give the same digest to every
build in a pipeline, so a builder stage and a final stage cannot land on
different bytes. (The manifest-list digest is the pin; each platform
resolves its own image through it.)

`.github/workflows/cdo-deps-image.yml` builds and smoke-tests on docker and
podman, on amd64 and arm64, for every PR touching the key inputs, and
publishes from staging. It also gates `docker/build`, since every job there
builds `cdo-build` anyway. The workflow is chained off `cdo-base-image`
rather than scheduled, so this layer rebuilds on the base that just shipped
and a failed base rebuilds nothing.

## Things that will bite

**The Ruby ABI path is hardcoded.** The `bundle install` cache mount targets
`/usr/local/bundle/ruby/3.2.0/cache` literally, because buildah at the
supported floor cannot expand a variable in a mount target. The build guards
this: it asserts the interpreter's ABI directory is `3.2.0` and that
`.ruby-version` matches `RUBY_VERSION`. A Ruby minor bump must edit the mount
target as well as `.ruby-version`.

The second guard exists because `.ruby-version` is an input to the content key
while the `Gemfile`'s `ruby` requirement is a range. Without it, bumping
`.ruby-version` before `cdo-base` ships the new interpreter would publish a new
key over a bundle the old interpreter compiled, and Bundler would not object.

**Dual-engine constraints.** The same Dockerfile must build on docker and on
podman/buildah at the versions Ubuntu 24.04 and GitHub Actions runners ship.
That rules out heredoc `RUN`, reliance on `SHELL`, and BuildKit-only COPY
flags. `COPY --chown` cannot read environment inherited from a parent image —
it expands only same-stage ARGs — which is why the uid/gid 1000 pair is
written literally.
