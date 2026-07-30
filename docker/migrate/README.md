# cdo-migrate

The seed image, layered on [cdo-gems](../gems/README.md): the Rails source
tree plus the 1.4 GB curriculum (`dashboard/config` levels, scripts,
scripts_json). It is the one image in the hierarchy that bakes the
curriculum, and it exists to seed a database that matches the code it
carries. It runs as a Job — `db:setup_or_migrate` then `seed:default` — and
never as a service, so autoscaling nodes never pull it.

Two consumers today:

- the devcontainer database bake
  ([.devcontainer/scripts/bake-db.sh](../../.devcontainer/README.md)), which
  runs this image against a mysql sidecar and bakes the resulting datadir
  into the sandbox db image;
- the k8s deploy Job described in the image-hierarchy RFC, once the k8s
  build moves onto this family.

## Why readers bake the curriculum

The seed Job must seed exactly the curriculum matching the code it deploys.
Baking pins that by construction: same commit, content-addressed image,
registry pull as the only dependency. A volume is mutable state something
else must sync to the right ref first. Levelbuilder is the opposite case —
it *writes* the curriculum — so it mounts a clone instead; see the RFC.

## What is in it

On top of cdo-gems: the repo-root bootstrap files (`deployment.rb`,
`config.yml.erb`, the Gemfile family), `config/`, `lib/`, `shared/`, the
whole `dashboard/` tree, and the Python venv. The venv is not optional —
`application.rb` requires `cdo/pycall` unconditionally, which shells out to
uv and loads libpython, so a Rails boot needs Python even though nothing
here runs it on purpose. uv fetches its own managed CPython (the repo pins
3.12; Debian bookworm ships 3.11), so no apt Python is installed.

Two deliberate absences:

- **No configuration.** locals.yml comes from the runner — a mount for the
  devcontainer bake, a ConfigMap in k8s. The one boot-time requirement is
  that `!Secret` keys reached during boot are stubbed (`slack_bot_token` is
  the first one hit); `.devcontainer/scripts/sandbox-locals.yml` stubs the
  full set.
- **No ExecJS runtime.** There is no Node here and nothing compiles assets,
  so `EXECJS_RUNTIME=Disabled` — the same move docker-thin's runtime
  targets make.

The devcontainer bake boots this image in the *development* and *test*
environments on the production gem set, a combination bare-metal dev
machines never see. The boot-time references to dev/test-only gems
(annotate_rb, prosopite, active_record_query_trace) are guarded with
`rescue LoadError`/`defined?` in dashboard source for that reason, and
`GitUtils.git_revision_short` returns nil rather than raising when there is
no git binary — `config/test.yml.erb` calls it mid-render, and an exception
there is silently swallowed as an empty config file, which un-stubs every
`!Secret` key. A new unguarded reference will surface in this image's smoke
test, which boots both environments.

The RFC splits this into a `dashboard` image (source, no curriculum) with
migrate layered on top. Until the dashboard image exists there is nothing
to share the source layer with, so this Dockerfile carries both; when
dashboard lands, this becomes `FROM dashboard` plus the curriculum COPY.

## Build

Context is the repo root, pruned by `Dockerfile.dockerignore` (an
allowlist, like docker/gems) to roughly 2.7 GB of source and curriculum:

    docker build -f docker/migrate/Dockerfile -t cdo-migrate:test .

`GEMS_IMAGE` defaults to the published `cdo-gems:latest`. Override it to
build against a local gem layer:

    docker build -f docker/migrate/Dockerfile \
      --build-arg GEMS_IMAGE=cdo-gems:local -t cdo-migrate:test .

The image lands around 3.4 GB. amd64 only, inherited from cdo-gems — see
docker/gems/README.md.

## Run

The default command is the seed Job. Point it at a database and give it a
locals.yml:

    docker run --rm \
      -v $PWD/.devcontainer/scripts/sandbox-locals.yml:/code-dot-org/locals.yml:ro \
      cdo-migrate:test

`db:setup_or_migrate` takes the schema:load path on an empty server and the
migrate path on an existing one, so the same Job serves first boot and
every deploy after. RAILS_ENV comes from the environment (unset means
development, which is what the devcontainer bake wants).

## Publish

`.github/workflows/cdo-migrate-image.yml` smoke-tests on docker and podman
for PRs touching this directory, and publishes weekly plus on demand. The
triggers deliberately exclude the source tree the image bakes: every commit
changes the image, and nothing needs a per-commit publish — a devcontainer
sandbox tolerates a stale bake because syncing it is an operator action
(`rake dashboard:setup_db`), and k8s deploys build their own migrate per
deploy. The same workflow then bakes and publishes cdo-dev-db from the
migrate image it just pushed. Tags are `git-<sha>` and `latest`; there is
no `lock-` tag because the content key for baked source is the commit
itself.
