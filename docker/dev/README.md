# cdo-dev

`cdo-dev` is the Docker image for local development. It uses `cdo-deps` as
its parent image. It includes the build tools, Node, Yarn, Ruby development
and test gems, and Playwright Chromium.

Use Linux with Docker or Podman. The image contains Chromium only. Run
browser tests with `--project=chromium`.

## Start the environment

From the repository root, build the image. The default `DEPS_IMAGE` is the
published `cdo-deps` image. Set it to `cdo-deps:local` if you built that
image locally.

```sh
docker build -f docker/dev/Dockerfile -t cdo-dev:local .
```

Start MySQL, Redis, and the development container.

```sh
cd docker/dev
docker compose up -d
docker compose exec app bash
```

Run these commands once in the container. They create the databases, add the
curriculum data, and download the apps package.

```sh
cd /code-dot-org/pegasus && bundle exec rake pegasus:setup_db
cd /code-dot-org/dashboard && bundle exec rake dashboard:setup_db
cd /code-dot-org && bundle exec rake package:apps
```

Start Rails from the repository root in the container.

```sh
bin/dashboard-server
```

Open <http://localhost:3000>. The database data stays in the `mysql-data`
volume. Use `docker compose down -v` only when you want to remove that data.

## Change frontend code

Run each needed server in another container shell.

```sh
cd /code-dot-org/apps && yarn start:cheapest
cd /code-dot-org/frontend && yarn dev
```

The apps server uses port 9000 and sends requests to Rails. The Vite server
uses port 3036 and serves `/frontend-studio/`. Stop a native development
environment before you start this one. The ports are fixed.

## Linked worktrees

A linked worktree needs an extra mount for its Git directory. Run this from
the checkout before `docker compose up`.

```sh
printf 'services:\n  app:\n    volumes:\n      - %s:%s:z\n' \
  "$(git rev-parse --git-common-dir)" "$(git rev-parse --git-common-dir)" \
  > docker/dev/compose.override.yaml
```

Do not use `docker compose -f compose.yaml`. That command ignores the
override file.

The mount makes Git report host paths. `dev.env` sets `TURBO_CACHE_DIR` for
that reason: turbo puts its cache beside the Git common directory, which is
outside the container mount.

## Local configuration

`dev.env` supplies the container configuration. You do not need a
`locals.yml`. It contains local AWS and secret values. Compose publishes the
development ports on `127.0.0.1` only. Do not change them to a network-wide
address.

For image details, see the [Dockerfile](Dockerfile),
[compose file](compose.yaml), and [smoke test](smoke-test.sh).
