# docker-image-targets

## ADDED Requirements

### Requirement: Base image is the official Ruby slim image
The image lineage SHALL start `FROM ruby:<version>-slim` where `<version>`
matches `.ruby-version`, pinned by digest. The build SHALL NOT compile Ruby
from source.

#### Scenario: Cold build performs no Ruby compile
- **WHEN** any image target is built from a clean cache
- **THEN** no `ruby-build`/`./configure && make` step executes, and
  `ruby -v` inside the image reports the version in `.ruby-version`

### Requirement: Runtime target excludes build and dev tooling
The `runtime` target SHALL contain only runtime dependencies. It SHALL NOT
contain `build-essential`, compilers, headers, chromium, sauce-connect, gdb,
node, or `development`/`test` bundler groups, nor bundler/gem download caches.

#### Scenario: Runtime image contents audited
- **WHEN** the `runtime` image is inspected (e.g. `dive`, `docker run which gcc`)
- **THEN** no compiler, chromium, or sauce-connect binary is present and
  `"${BUNDLE_PATH}"/ruby/*/cache` is empty

#### Scenario: Runtime image boots Rails
- **WHEN** a container from `runtime` starts the dashboard against a seeded DB
- **THEN** `/health_check` returns 200

### Requirement: Runtime target runs as non-root
The `runtime` target SHALL declare a numeric non-root `USER` and be runnable
with `runAsNonRoot: true`.

#### Scenario: Pod security admission
- **WHEN** the runtime image runs in a pod with `runAsNonRoot: true`
- **THEN** the pod starts without the kubelet rejecting the image user

### Requirement: jemalloc is preloaded
The `runtime` target SHALL install `libjemalloc2` and set `LD_PRELOAD` via an
arch-agnostic path so both amd64 and arm64 variants use jemalloc.

#### Scenario: Allocator verified in-container
- **WHEN** `ruby -e 'exit'` runs under the runtime image with
  `MALLOC_CONF=stats_print:true`
- **THEN** jemalloc statistics are emitted on exit

### Requirement: Bootsnap is precompiled at build time
The build SHALL run `bundle exec bootsnap precompile --gemfile` after
`bundle install` and `bootsnap precompile` over app code after source COPY,
and the cache SHALL ship in the runtime image.

#### Scenario: Warm boot cache present
- **WHEN** the runtime image starts Rails
- **THEN** bootsnap loads from a prepopulated cache directory (no cold-cache
  compile on first boot)

### Requirement: Dev target is a superset of the same base
The `dev` target SHALL derive from the same `base` stage as `runtime` and add
the developer toolchain (build-essential, node, chromium, zsh, awscli). It
SHALL be able to run `bundle install` and the dashboard test suite.

#### Scenario: Dev target builds gems locally
- **WHEN** `bundle install` runs inside a `dev` container with a modified
  Gemfile
- **THEN** native extensions compile successfully

#### Scenario: Shared base layers
- **WHEN** both `runtime` and `dev` images are pulled on one machine
- **THEN** their `base`-stage layers are identical (shared digests)
