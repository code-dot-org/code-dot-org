# cdo-gems

The production gem set, compiled in [cdo-build](../build/README.md) and
copied onto [cdo-base](../base/README.md). The shipped image carries the
gems and none of the toolchain that built them.

Contents on top of cdo-base: `/usr/local/bundle` (613 MB), the lockfile, and
the engine gemspecs. `BUNDLE_PATH`, `BUNDLE_WITHOUT`, `BUNDLE_DEPLOYMENT`,
and `PATH` are exported for the runtime. Runs as the non-root `cdo` user.

Keyed on `Gemfile.lock`: it rebuilds when the lockfile moves and everything
downstream inherits it, so a gem bump costs one gem-layer rebuild rather
than one per flavor.

## One gem set, not one per flavor

The bundle is the union of every non-development group —
`BUNDLE_WITHOUT=development:test`, which keeps `staging`, `levelbuilder`,
`adhoc`, and `production`. Workers could drop the `mini_racer`/`libv8` group
(~200 MB), but a node running both web and worker pulls one shared 613 MB
layer instead of two near-duplicate private ones, so the union wins even
though each flavor carries some slack.

The `staging` and `levelbuilder` groups are folded into the union rather than
given their own image: a staging-specific gem set would break artifact
promotion, since the image tested is then not the image deployed.

## Build

The context is the repo root, not this directory, because Bundler needs the
lockfile and the engine gemspecs. `Dockerfile.dockerignore` prunes the
context from 6.7 GB to 56 kB. cdo-build is unpublished, so `BUILD_IMAGE`
has no default and must be built first:

    docker build -t cdo-build:local docker/build/
    docker build -f docker/gems/Dockerfile \
      --build-arg BUILD_IMAGE=cdo-build:local -t cdo-gems:test .

`BUNDLE_JOBS` defaults to the build machine's core count. Set it to a number
only to throttle a memory-constrained build — each job can spawn a native
compile, so peak memory scales with the job count, not with cores.

The `.gem` tarball cache is a BuildKit cache mount rather than an image
layer, which keeps 110 MB of tarballs out of the image and stops a canceled
or lockfile-invalidated build from re-downloading every gem. Cache mounts are
the one BuildKit mount buildah supports natively at the 4.9 floor. The mount
path embeds `ruby/3.2.0` and must be updated when Ruby is bumped, or it
silently stops caching.

`.git` directories are stripped from git-sourced gems, which saves 46 MB and
avoids needing `git` at runtime — cdo-base does not ship it.

## Smoke test

    ./docker/gems/smoke-test.sh cdo-gems:test docker
    ./docker/gems/smoke-test.sh cdo-gems:test podman

The checks that matter are the seam between the two images: the native
extensions were compiled in cdo-build against its dev headers, and nothing
proves they still resolve until they are required against cdo-base's runtime
libraries. So mysql2, rmagick, nokogiri, and mini_racer are each loaded for
real. The toolchain checks are inverted — a passing `command -v cc` is a
failure, because it would mean the final stage accidentally stacked on the
builder.

## mini_racer aborts at teardown under jemalloc

Creating any V8 context makes the process abort at interpreter teardown with
`free(): invalid pointer` and exit 139. The JS evaluates correctly first; the
abort is in teardown, and an explicit `MiniRacer::Context#dispose` does not
avoid it, so it is not reachable from Ruby.

The cause is the jemalloc `LD_PRELOAD` cdo-base ships interposing on V8's own
allocator. This is not new to the image hierarchy: production has had the
same combination all along, because `cookbooks/cdo-apps/recipes/jemalloc.rb`
sets the same `LD_PRELOAD` for every app and `mini_racer` is in the
`:production` group.

It is worth deciding deliberately rather than inheriting, because in k8s the
exit code is visible: a web pod that has evaluated any JS exits 139 on
SIGTERM, which reads as a crash in pod status and deploy dashboards even
though the work succeeded. Options are to scope the preload to processes that
do not run JS, to set `MALLOC_CONF` so jemalloc does not interpose on V8, or
to accept it as prod does today. The smoke test clears `LD_PRELOAD` for the
mini_racer check only, and asserts what cdo-gems owns: that libv8 compiled,
loads, and runs JS.

## Dual-engine policy

Same rule and floor as cdo-base — one Dockerfile building on both Docker and
Podman, Podman >= 4.9 / buildah >= 1.33. No heredoc `RUN <<EOF`, no reliance
on `SHELL`, no `COPY --parents` / `COPY --link`. See
[docker/base/README.md](../base/README.md#dual-engine-policy).

`COPY --parents` is what docker-thin uses to copy the engine gemspecs by
glob. It needs buildah 1.40; the floor is 24.04's 1.33.7. The five files are
therefore listed one per `COPY` line, which is not only portable but tighter:
copying the whole `dashboard/engines` tree would let engine source — which
changed 46 times in the last 12 months against 5 changes to these files —
invalidate the bundle install below it. A new engine needs a new pair of
lines, and forgetting fails loudly, since Bundler reports the missing path
gem by name under frozen mode.

Verified on the floor rather than assumed: buildah 1.33.7 from Ubuntu 24.04
builds both this image and cdo-build, honors the
`<dockerfile>.dockerignore` convention (it names the file in the error when
an excluded path is copied), and supports `--mount=type=cache` with
`uid`/`gid`.

Two things are *not* fixed by a newer podman, so they stay banned regardless
of the floor: `COPY --link` is still a no-op on buildah, and `COPY --exclude`
is parsed and silently ignored as late as buildah 1.43.2 — it copies the
excluded paths with no error. The latter matters for the flavors below this
one, where the curriculum split must live in `.dockerignore` rather than in a
`COPY` flag.

## amd64 only

cdo-base is multi-platform; this image is not, and the reason is the
lockfile. `PLATFORMS` lists `arm64-darwin-25`, `ruby`, and `x86_64-linux` —
no `aarch64-linux`. Bundler on arm64 Linux therefore resolves the generic
`ruby` variant of every platform-specific gem, and for `libv8-node` the only
non-Darwin candidates in the lockfile are `x86_64-linux` and `ruby`, so arm64
would build V8 from source. That is a different artifact, not the same image
for another architecture.

Adding arm64 means `bundle lock --add-platform aarch64-linux` plus
confirming every platform-specific gem in the lockfile publishes an
aarch64-linux build. That is its own change with its own verification, so
this image stays amd64 until then. cdo-base remains multi-platform, so
nothing downstream forecloses the option.

## CI and published image

`.github/workflows/cdo-gems-image.yml` runs the dual-engine smoke matrix on
PRs that touch the lockfile, the engine gemspecs, cdo-build, or this
directory — each job builds cdo-build first, since it is unpublished. Engine
source is not a trigger, matching the `COPY` lines. On staging pushes
touching those paths, and on a weekly cron that picks up the refreshed
cdo-base, it publishes:

    ghcr.io/code-dot-org/cdo-gems:latest
    ghcr.io/code-dot-org/cdo-gems:git-<sha>
    ghcr.io/code-dot-org/cdo-gems:lock-<first 12 of sha256(Gemfile.lock)>

The `lock-` tag is the content key: a downstream build can ask for the gem
layer matching its own lockfile and get a cache hit whenever the lockfile has
not moved, regardless of which commit built it. Pin by digest for byte
stability.

The publish leg uses plain `docker build` rather than buildx with registry
cache, because a docker-container buildx builder cannot see the locally built
cdo-build image and would try to pull the tag from a registry. The cost is no
registry build cache, which is minor here: the image rebuilds when the
lockfile moves, and a moved lockfile invalidates the gem layer anyway, so a
cold build is the expected case.
