# Devcontainer

A container development environment for code-dot-org. Everything happens
inside the container: git, tests, debugging, dev servers, commits.

One configuration, not a set of personas. The [cdo-dev](../docker/dev/README.md)
image carries every toolchain — Ruby with the dev and test gems, Node, yarn,
uv, Playwright, debuggers — so the same sandbox serves `dashboard/`, `apps/`
and `frontend/` work. Disk is cheap on a laptop; a fragmented set of
half-environments is not.

## Prerequisites

- Docker Engine with Compose v2.23+, or podman
- `git-lfs` (`git lfs install`)
- VS Code with the Dev Containers extension, optional — the compose file works
  on its own

## Quick start

    # 1. The dev image. Published, so normally just pull it:
    docker pull ghcr.io/code-dot-org/cdo-dev:latest

    # 2. The seeded database image, built locally (~20 min, one-time).
    #    Seeding runs the cdo-migrate image (pulled on first use):
    .devcontainer/scripts/bake-db.sh
    docker build -f .devcontainer/Dockerfile.db -t cdo-dev-db:latest .devcontainer

    # bake-db.sh writes .devcontainer/mysql-data.tar, which is that context.

    # 3. Open in VS Code: "Dev Containers: Reopen in Container"
    #    or without VS Code:
    .devcontainer/scripts/init-repo-volume.sh
    docker compose -f .devcontainer/docker-compose.yml up -d
    docker compose -f .devcontainer/docker-compose.yml exec app bash

CI publishes the database image too, seeded by the migrate image from the same
commit. Once that GHCR package is flipped public, step 2 becomes a pull like
step 1 and the local bake is only for testing a change to the bake itself:

    docker pull ghcr.io/code-dot-org/cdo-dev-db:latest
    export CDO_DEV_DB_IMAGE=ghcr.io/code-dot-org/cdo-dev-db:latest

`CDO_DEV_DB_IMAGE` still defaults to the local `cdo-dev-db:latest`; that
default moves to the published image once the pull works without a token.

To build the dev image yourself instead of pulling, see
[docker/dev/README.md](../docker/dev/README.md), and point the compose file at
it with `CDO_DEV_IMAGE=cdo-dev:local`.

## The repo lives in a volume

`scripts/init-repo-volume.sh` runs on the host before compose comes up and
clones your checkout into the `cdo-repo` volume — a real clone, not a
bind-mount. It is idempotent, and it resolves worktrees to the real `.git`
directory, so it works from a worktree as well as a full checkout. It clones
your **current branch**, not a fixed default. Measured at 23 s and 8.7 GB on a
fast machine; after that the volume persists across restarts and rebuilds.

Note what "idempotent" means here: on a volume that already has a clone the
script only runs `git fetch origin`, and `origin` is GitHub, not your checkout.
Your host's unpushed branches never reach an existing sandbox, and
`sandbox-locals.yml` is only copied on the *first* run, so edits to it do not
propagate either. `docker volume rm cdo-repo` is the reset.

A bind-mount of the host checkout would be simpler, but the volume is what
makes the environment *the same* everywhere rather than half host and half
image: no host Ruby, no host node_modules, no host filesystem semantics
leaking in. Your work lives in the volume, so commit and push from inside the
container.

The volume's remote is set to GitHub, not your host checkout, so pushes go
where you expect.

## Layout

| path | what |
|---|---|
| `devcontainer.json` | the VS Code / CLI entry point |
| `docker-compose.yml` | app, pre-seeded mysql, redis |
| `Dockerfile.db` | the pre-seeded mysql image |
| `scripts/init-repo-volume.sh` | host-side: create and populate the repo volume |
| `scripts/bake-db.sh` | host-side: seed a datadir for `Dockerfile.db` |
| `scripts/sandbox-locals.yml` | zero-credential `locals.yml` for the sandbox |

The image itself lives in [docker/dev/](../docker/dev/README.md), alongside
the rest of the container hierarchy. This directory is only the wiring.

## The database comes from the migrate image

`bake-db.sh` starts a mysql sidecar and runs
[cdo-migrate](../docker/migrate/README.md) against it — the same image whose
default job seeds deploy databases — then tars the datadir for `Dockerfile.db`
to bake. One lineage: the code that seeds your sandbox database is the code
baked into the published migrate image, not whatever happens to be in your
repo volume. The bake does not touch the volume and works before
`init-repo-volume.sh` has ever run.

The image is otherwise stock `mysql:8.0` — stock entrypoint, no scripts, no
config. The one deviation is where the datadir is baked: `/opt/mysql-data`
rather than the base image's `/var/lib/mysql`, which is a declared `VOLUME`.
Compose points mysqld at it with `command: --datadir=/opt/mysql-data`, the
official image's documented way to pass server flags.

### The database is ephemeral

There is no volume. The baked datadir is read out of the image through
overlayfs and writes go to the container's copy-on-write layer, which means:

- **start is instant** — nothing is copied anywhere;
- **each container is isolated** — parallel sandboxes need no naming scheme
  to keep their databases apart;
- **recreate is the reset** — `up -d --force-recreate db` returns to the
  pristine baked state, and a rebuilt image takes effect the same way, with
  no `down -v` ritual and no volume that quietly outlives the image it came
  from;
- **writes die with the container.** State you want to keep belongs in a
  seed, or in the repo volume, not in this database.

`stop` and `start` keep the writable layer, so that is the way to pause a
sandbox without losing what is in it.

### Syncing a stale sandbox

Nothing migrates or seeds on container start. The baked schema and curriculum
are as of the last `cdo-migrate` publish, so a branch with newer migrations
will drift, and Rails says so — development mode raises
`PendingMigrationError` naming what to run. Syncing is an operator action:

    cd dashboard && bundle exec rake dashboard:setup_db

That is `db:setup_or_migrate` plus `seed:default`, the same pair the bake
runs. The scripts and DSL-defined-levels legs are incremental — each file is
skipped when its md5 matches what is already in the database — so the cost is
proportional to how stale the bake is, not to the size of the curriculum. A
bake as old as the last migrate publish generally needs nothing; re-run the
bake, or pull a newer image, when it does.

The old route precompiled test assets into the repo volume as a side effect.
The migrate route cannot (its filesystem is discarded), so before the first
dashboard test run in a sandbox:

    cd dashboard && RAILS_ENV=test bundle exec rake assets:precompile

S3 emulation is not wired up yet — `sandbox-locals.yml` points at a minio that
nothing starts, so features touching S3 fail. `docker/developers/` has the
tooling (`install-s3.sh`, `utils/s3/populator.rb`) when someone gets to it.

## Tuning

Compose reads these from the environment:

| variable | default | what |
|---|---|---|
| `CDO_DEV_IMAGE` | `ghcr.io/code-dot-org/cdo-dev:latest` | the dev image |
| `CDO_DEV_DB_IMAGE` | `cdo-dev-db:latest` | the seeded database image |
| `CDO_MIGRATE_IMAGE` | `ghcr.io/code-dot-org/cdo-migrate:latest` | what bake-db.sh seeds with |
| `CDO_REPO_VOLUME` | `cdo-repo` | repo volume name, for parallel sandboxes |
| `CDO_MEMORY_LIMIT` | `12g` | memory ceiling for the app container |
| `CDO_RAILS_PORT` | `3000` | published Rails port |
| `CDO_APPS_PORT` | `9000` | published apps dev-server port |
| `CDO_FRONTEND_PORT` | `3036` | published frontend vite port |

`CDO_REPO_VOLUME` is how you run more than one sandbox at a time: give each
its own volume name and its own ports.
