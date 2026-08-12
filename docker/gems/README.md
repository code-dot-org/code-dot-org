# cdo-gems

The production gem set, compiled in [cdo-build](../build/README.md) and
copied onto [cdo-base](../base/README.md). The shipped image carries the
gems and none of the toolchain that built them.

Contents on top of cdo-base: `/usr/local/bundle` (613 MB), the lockfile, and
the engine gemspecs. `BUNDLE_PATH`, `BUNDLE_WITHOUT`, and `BUNDLE_DEPLOYMENT`
are exported for the runtime. `PATH` is not: `${BUNDLE_PATH}/bin` is already
on it from the ruby base image, and the bundle's own binstub directory
(`ruby/<abi>/bin`) is not on it either way, so `bundle exec` is what selects a
locked executable — bare `rake` is the base image's rake. Runs as the non-root
`cdo` user.

Keyed on `Gemfile.lock`: it rebuilds when the lockfile moves and everything
downstream inherits it, so a gem bump costs one gem-layer rebuild rather
than one per flavor.

## Why this is separate from cdo-base

The two rebuild for different reasons.

cdo-base is built from a Dockerfile alone, with no repository content, so a
weekly cron can rebuild it for Debian and Ruby security patches under one tag
that every branch shares. This image is keyed on `Gemfile.lock`, so it rebuilds
when a gem moves.

Merging them would tie both to whichever trigger fires more often. Every weekly
security rebuild would recompile 374 gems and re-ship a 613 MB layer for an OS
patch that touched none of them, and every gem bump would re-run the base's apt
layer.

cdo-base also has consumers that must not carry gems:

- cdo-build, which compiles the gem layer and therefore cannot start from an
  image that already contains it
- this image's final stage, which lands the bundle on a fresh copy of the base
  so no toolchain ships
- ops and debug pods, or a future service with its own Gemfile, which want the
  runtime floor and nothing else

## One gem set, not one per flavor

The bundle is the union of every non-development group —
`BUNDLE_WITHOUT=development:test`, which keeps `staging`, `levelbuilder`,
`adhoc`, and `production`. Per-flavor bundles could each shed some gems, but
a node running both web and worker pulls one shared gem layer instead of
two near-duplicate private ones, so the union wins even though each flavor
carries some slack.

The `staging` and `levelbuilder` groups are folded into the union rather than
given their own image: a staging-specific gem set would break artifact
promotion, since the image tested is then not the image deployed.

## Build

The context is the repo root, not this directory, because Bundler needs the
lockfile and the engine gemspecs. `Dockerfile.dockerignore` prunes the
context from 6.7 GB to 56 kB. cdo-build is unpublished, so `BUILD_IMAGE`
has no default and must be built first:

```sh
docker build -t cdo-build:local docker/build/
docker build -f docker/gems/Dockerfile \
  --build-arg BUILD_IMAGE=cdo-build:local -t cdo-gems:test .
```

`BUNDLE_JOBS` defaults to the build machine's core count. Set it to a number
only to throttle a memory-constrained build — each job can spawn a native
compile, so peak memory scales with the job count, not with cores.

The `.gem` tarball cache is a BuildKit cache mount rather than an image
layer, which keeps 110 MB of tarballs out of the image and stops a canceled
or lockfile-invalidated build from re-downloading every gem. Cache mounts are
the one BuildKit mount buildah supports natively at the 4.9 floor.

The mount target embeds the Ruby ABI directory as a literal, and it is the only
such path in the family that does not derive it from the interpreter: mount
options do not reliably expand variables at the buildah floor. The first line of
the `RUN` body compares the literal against `RbConfig`, so a Ruby bump fails the
build loudly here instead of leaving a mount target that no longer exists and a
cache that silently went cold.

`.git` directories are stripped from git-sourced gems, which saves 46 MB and
avoids needing `git` at runtime — cdo-base does not ship it.

## Smoke test

```sh
./docker/gems/smoke-test.sh cdo-gems:test docker
./docker/gems/smoke-test.sh cdo-gems:test podman
```

The checks that matter are the seam between the two images: the native
extensions were compiled in cdo-build against its dev headers, and nothing
proves they still resolve until they are required against cdo-base's runtime
libraries. So mysql2, rmagick, and nokogiri are each loaded for real. The
toolchain checks are inverted — a passing `command -v cc` is a
failure, because it would mean the final stage accidentally stacked on the
builder.

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
`ruby` variant of every platform-specific gem and compiles its native
extension from source. That is a different artifact, not the same image for
another architecture.

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
touching those paths, and on every successful `cdo-base-image` publish, it
publishes:

```
ghcr.io/code-dot-org/cdo-gems:bundle-<sha256 of the bundle inputs>
ghcr.io/code-dot-org/cdo-gems:git-<sha>
ghcr.io/code-dot-org/cdo-gems:latest
```

The `bundle-` tag is the content key: a downstream build asks for the gem layer
matching its own inputs and gets it whenever those inputs have not moved,
regardless of which commit built it. It keys on everything that decides what
lands in the bundle — `.ruby-version`, `Gemfile`, `Gemfile.lock` and both
Dockerfiles — rather than on the lockfile alone. Group membership and
`install_if` conditions live only in the Gemfile, since the lockfile records
names and versions but not which groups they belong to. Moving a gem into
`:test` therefore changes what `BUNDLE_WITHOUT` installs while leaving
`Gemfile.lock` byte-identical, and a key over the lockfile alone would republish
different contents under a name something else had already resolved.

Those five are literal paths rather than globs, because `hashFiles` digests
files in glob order and `@actions/glob` documents its order as not guaranteed —
a glob matching more than one file would leave the key depending on `readdir`.
The engine gemspecs are not listed and do not need to be: `Gemfile.lock` carries
a `PATH` section naming every engine, its version, and its dependencies, so
adding an engine or bumping one moves the lockfile and therefore the key.

`git-<sha>` keeps that prefix and its full length to match cdo-base, rather
than the ecosystem default of `sha-<7chars>`.

`bundle-` and `git-` are both re-pushed onto a refreshed cdo-base every time a
base publish triggers this workflow, which is the point of the chain.

That chain is a `workflow_run` trigger on `cdo-base-image`, not a cron of this
workflow's own. The weekly cadence is inherited: cdo-base's cron publishes a
fresh base, and its success is what rebuilds the gem layer on top of it. A
*failed* base run triggers nothing, so the gem layer is never rebuilt on a base
known to be broken — which the previous arrangement, a 4am/8am cron offset, could
not express. It was a timer standing in for a dependency edge, and it fired
whether or not the base it was waiting on had worked. Because the event fires for
every base conclusion on every branch, the first job filters it to a successful
`staging` run; the two jobs below it depend on that job, and a skipped job skips
its dependents.

Every build in the workflow takes cdo-base as a digest resolved once, in a
first job, rather than each build resolving `:latest` for itself. Otherwise a
base rebuild landing mid-run can leave extensions compiled against one base's
dev headers running on another base's runtime libraries, and the base the
smoke matrix validated is not provably the one under the published image.

The publish leg re-runs both smoke suites against the images it built itself,
rather than trusting the matrix legs, which built the same Dockerfiles on other
runners.

## No tag here is immutable

All three float. `bundle-` and `git-` are re-pushed onto a refreshed cdo-base on
every base publish, and `latest` follows every publish of any kind. A given tag
therefore names different bytes over its life, `git-<sha>` included: a base
refresh rebuilds an unchanged commit.

That is the normal arrangement for a continuously rebuilt image — upstream
re-pushes `ruby:3.2.11-slim-bookworm` on every Debian or Ruby security fix — and
the answer is the same here as there: immutability is a digest's job, not a
tag's. Nothing prunes untagged versions of this package, so a digest stays
resolvable indefinitely, and this workflow already consumes its own base that
way, resolving `cdo-base:latest` to a digest once per run.

cdo-gems is a build input rather than a deployed artifact, so there is little to
pin it for: a rollback names the image that shipped, meaning web or worker, and
those record their own base by digest.

## Who may publish

Only staging publishes the tags above. A dispatch on any other ref publishes
`dev-<sha>` and nothing else, which keeps the publish leg verifiable from a
branch — how cdo-base's was proven before it merged — without an unreviewed ref
overwriting what downstream resolves.

That split is declared in the tag list, but it is not what enforces it. A
`workflow_dispatch` runs the workflow file belonging to the ref it was
dispatched on, so a check written in this file is editable by the ref it is
meant to restrain, and so is the `if:` that decides whether the publish job
runs at all. Enforcement has to live outside the file:

- the `build-push` job declares `environment: ghcr-publish`. A referenced
  environment is auto-created without protection rules, so that line is inert
  until someone restricts the environment's deployment branches to `staging` in
  repository settings. It is the hook, not the guarantee
- for the policy to bind rather than advise, the credential the push needs has
  to be an environment secret. While the login uses `secrets.GITHUB_TOKEN`, a
  ref that deletes the `environment:` line keeps its ability to push, so what
  is in place stops mistakes rather than a determined write-capable actor

Publishes also serialize on one `cdo-gems-publish` concurrency group shared by
every ref, so two runs cannot interleave and half-overwrite the tag set. The
group cancels in progress: a cancelled publish can leave tags pointing at
different builds, and nothing resolves `latest` programmatically.

The publish leg builds with plain `docker build` on the default docker-driver
builder, because cdo-build exists only in the job's local image store and a
docker-container builder would try to pull the tag from a registry. The cost is
no registry build cache, which is minor here: the image rebuilds when its inputs
move, and moved inputs invalidate the gem layer anyway, so a cold build is the
expected case.

Tagging and pushing is a step of its own rather than `docker/build-push-action`
with `push: true`. The docker driver does support pushing; the problem is that
the action publishes in the same step that builds, which would put the image in
the registry before the smoke suites ran. A failing smoke test has to be able to
stop the publish.

## What downstream images pin

Consumers compute the key from their own checkout, with the same pattern list
the publish leg uses:

```yaml
GEMS_IMAGE: ghcr.io/code-dot-org/cdo-gems:bundle-${{ hashFiles('.ruby-version', 'Gemfile', 'Gemfile.lock', 'docker/build/Dockerfile', 'docker/gems/Dockerfile') }}
```

That way inputs with no published gem layer are a hard build failure instead of
a silent hit on a stale `:latest`.

`hashFiles` is a GitHub Actions expression, so the key is computable in a
workflow and not from a shell. That is the deliberate cost of not carrying our
own hashing script: downstream images are built in CI, and a developer building
locally uses `:latest` or pins a digest. The first consumer duplicates the
pattern list, which is the point at which it should move into a composite action
instead of being copied again.

`latest` is for humans reading the package page. Pin a digest where byte
stability matters — see the section above on why no tag here provides it.

## Gem tree ownership

`/usr/local/bundle` is owned by uid 1000 and writable at runtime. That is
deliberate: cdo-dev, which stacks above this image, delta-installs the
development and test groups into this same tree as that user, so a read-only
tree would force a second, near-duplicate bundle. Read-only hardening belongs
to the production flavors and to the pod `securityContext`, which can drop
write access per workload; it does not belong to a substrate shared with the
dev image.
