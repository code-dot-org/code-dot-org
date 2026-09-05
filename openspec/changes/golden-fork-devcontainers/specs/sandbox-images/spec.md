# sandbox-images

## ADDED Requirements

### Requirement: Base toolchain image
The system SHALL publish a multi-arch (linux/amd64, linux/arm64) `cdo-dev-base` image containing the Ruby toolchain pinned to `.ruby-version` (slim Debian base with an explicit release suffix, never a bare rolling tag), bundler at the `Gemfile.lock` pin, installed gems at `BUNDLE_PATH`, uv with the Python venv fully populated including workspace packages, Node at the `.nvmrc` major with corepack and the `packageManager`-pinned Yarn, warm Yarn Berry global cache at `YARN_GLOBAL_FOLDER`, and the empirically-derived apt package set — each package traceable to a recorded failure that proved it in.

#### Scenario: Layers keyed by lockfiles
- **WHEN** a commit changes `Gemfile.lock` but not `frontend/yarn.lock`
- **THEN** the rebuilt image reuses the yarn-cache layer unchanged and only the gem layer differs, so a puller downloads only the changed layer

#### Scenario: Offline-complete Python environment
- **WHEN** a container from the image runs `bundle exec rails runner 1` with `--network=none`
- **THEN** boot completes without any package-registry fetch (workspace packages were installed at bake, not deferred)

### Requirement: Seeded database image
The system SHALL publish a multi-arch `cdo-dev-db` image based on the current `mysql:8.0` Docker Official image, with a fully seeded datadir (dashboard, pegasus) baked at a non-VOLUME path, seeded by the image's own mysqld version, cleanly shut down before the layer closes, with binlogs purged.

#### Scenario: Fork serves in under a second
- **WHEN** a container is started from the image on a warm host
- **THEN** `mysqladmin ping` succeeds within 1.5 s of `docker run` returning, without any datadir copy at create time

#### Scenario: Server/datadir version match by construction
- **WHEN** the bake pipeline runs
- **THEN** the mysqld that executes the seed is the same binary the published image ships, so an InnoDB version-downgrade refusal cannot occur

#### Scenario: Clean-shutdown gate
- **WHEN** the bake's mysqld shutdown does not complete cleanly (socket/pid still present, or the error log shows recovery on a probe restart)
- **THEN** the bake fails and no image is published

### Requirement: Zero-credential bake
The image bake SHALL run with no AWS credentials, with `aws_s3_emulated: true`, `AWS_EC2_METADATA_DISABLED=true`, and placeholder secrets; the bake SHALL fail if any step attempts a live AWS call.

#### Scenario: Seed completes credential-free
- **WHEN** the bake seeds the database with no AWS credentials present
- **THEN** `seed:default` exits 0 and the log contains no S3 connection attempts

### Requirement: LFS-verified bake tree
The bake SHALL verify that all git-lfs content required by seeding and serving (at minimum `dashboard/config/datablock_storage`, `dashboard/config/locales`) is smudged to real content before building, and SHALL fail on pointer files.

#### Scenario: Pointer file detected
- **WHEN** any required LFS path contains an unsmudged pointer stub
- **THEN** the bake aborts with a message naming the path

### Requirement: Content-hash rebuild triggers
Image rebuilds SHALL be triggered by content-hash change of their inputs (gems layer: `Gemfile.lock`; yarn layer: `frontend/yarn.lock`, `apps/yarn.lock`; db image: `dashboard/db/schema.rb`, `dashboard/lib/tasks/seed.rake`, curriculum directories) plus a scheduled weekly rebuild, and SHALL NOT rebuild when no input changed.

#### Scenario: No-change day
- **WHEN** the scheduled trigger fires and every input hash matches the last published build
- **THEN** no new image is pushed and the existing tags remain current

### Requirement: Repo and build artifacts excluded from registry images
Registry images SHALL NOT contain the repository tree, the apps/ webpack build output, or any per-branch artifact.

#### Scenario: Size gate
- **WHEN** a candidate `cdo-dev-base` exceeds 6 GB or `cdo-dev-db` exceeds 4 GB (uncompressed)
- **THEN** the publish job fails and reports the layer breakdown

### Requirement: Dated tags with retention
Published images SHALL carry immutable date+sha tags retained for at least 28 days alongside a moving `latest`, so a branch older than the current golden can pin a contemporaneous image.

#### Scenario: Old branch pins an old tag
- **WHEN** a developer requests a sandbox pinned to a date tag within retention
- **THEN** the pull succeeds and the sandbox's schema matches that date's staging
