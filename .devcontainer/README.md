# Devcontainer

A container you can develop in: Rails, the apps webpack dev server, the
frontend Vite server, the test suites, the linters. Faster to reach than
[SETUP.md](../SETUP.md), and the same on every machine.

It is one configuration, not a menu. The container has the whole toolchain
whether or not today's work needs all of it.

## What runs where

| | |
|---|---|
| `app` | [cdo-dev](../docker/dev/README.md), the development member of the [image family](../docker/README.md). Nothing starts by itself — you run Rails and the dev servers in a terminal. |
| `db` | `mysql:8.0` with a seeded dashboard datadir baked in. |
| `redis` | `redis:7`, stock. |
| `minio` | S3, emulated. A level page asks S3 whether its lesson has a PDF; without an endpoint that question is a 500. A one-shot `minio-init` creates the buckets. |

The gems come from the same `cdo-deps` layer the production image is built
on, so what you load in development is what production resolved.

## Prerequisites

- Docker Engine + Compose v2, or Docker Desktop
- VS Code with the Dev Containers extension (optional — plain `docker compose`
  works)

Build the two images once:

```shell
# The application image. docker/README.md covers the layers below it.
docker build -t localhost/cdo-dev:local docker/dev/

# The database. ~40 min the first time: it seeds a real dashboard, then
# exports the datadir. The tar it leaves behind is ~3 GB and gitignored.
.devcontainer/bake-db.sh
docker build -f .devcontainer/Dockerfile.db -t cdo-dev-db:local .devcontainer
```

Override either image with `CDO_DEV_IMAGE` / `CDO_DEV_DB_IMAGE` — that is the
seam a published `ghcr.io/code-dot-org/cdo-dev` tag will use.

## Start it

```shell
cp -n .devcontainer/locals.yml.sample locals.yml
```

Then either open the folder in VS Code and run "Dev Containers: Reopen in
Container", or:

```shell
docker compose -f .devcontainer/docker-compose.yml up -d
docker compose -f .devcontainer/docker-compose.yml exec app bash
```

First start takes a few minutes: the entrypoint applies whatever migrations
the checkout has gained since the database was baked, and downloads the
prebuilt apps package so level pages render. After that:

```shell
bin/dashboard-server        # Rails, http://localhost-studio.code.org:3000
```

## macOS

The checkout is bind-mounted from the host, which is right on Linux and
unusable on macOS — a bind mount there is slow enough that Rails boot and
webpack builds stop being worth waiting for. Put the checkout in a named
volume instead. Clone into the volume once:

```shell
docker volume create cdo-workspace
docker run --rm -v cdo-workspace:/w -v "$PWD":/src:ro alpine/git \
  clone --no-hardlinks /src /w
```

and tell compose to use it, by writing `.devcontainer/.env`:

```
CDO_WORKSPACE_TYPE=volume
CDO_WORKSPACE_SOURCE=cdo-workspace
```

Everything else is unchanged: same `docker-compose.yml`, same
`devcontainer.json`, same "Reopen in Container". `node_modules`,
`apps/.yarn/cache` and `apps/build` then live volume-side too, which is most
of the point — they are the directories a bind mount is slowest at.

The tradeoff is that the volume is a second clone. It has its own working
tree and its own branch; `git remote set-url origin` it and push from inside
the container. The image already marks `/code-dot-org` a safe directory, so
git works there regardless of who owns the files.

The image family is multi-arch, so Apple Silicon runs a native arm64
container: pull the published image, or build the chain locally per
[docker/README.md](../docker/README.md).

## Daily work

```shell
bin/dashboard-server                         # Rails on 3000
bundle exec rails console
bundle exec spring testunit test/models/concept_test.rb
bundle exec rake db:migrate
mysql -h db -uroot -ppassword
redis-cli -h redis ping

cd frontend && yarn install && yarn dev      # Vite on 3036
cd apps    && yarn install && yarn start     # webpack dev server on 9000
cd apps    && yarn test:unit test/unit/gridUtilsTest.js
./tools/hooks/pre-commit                     # what the git hook runs
```

With Rails up, the Vite app is reachable through it at
`http://localhost-studio.code.org:3000/frontend-studio/`.

### Developing in apps/

The container starts with `use_my_apps: false`, serving the prebuilt package
the entrypoint downloaded: level pages render, but nothing you edit under
`apps/src` reaches the browser. To change that, once:

```shell
sed -i 's/^use_my_apps: false/use_my_apps: true/' locals.yml
bundle exec rake package:apps:symlink        # -> apps/build/package
# restart Rails; locals.yml is read at boot
cd apps && yarn start                        # writes as it compiles
```

Then browse port 9000 rather than 3000. It proxies everything it does not
serve to Rails, and reloads on save.

## The database is scratch space

The seeded datadir is baked into the `cdo-dev-db` image, so each container
writes to a copy-on-write layer. `docker compose stop` and `start` keep those
writes. `down`, and rebuilding the container, throw them away: rows you
inserted, migrations you applied, test-database seeds. You come back to the
bake, and the entrypoint replays the missing migrations — a couple of
minutes, not a reseed. Rebake when that replay stops being cheap.

## Ports

| Host | Container | |
|------|-----------|---|
| 3000 | 3000 | Rails |
| 9000 | 9000 | apps webpack dev server |
| 3036 | 3036 | Vite |
| 13306 | 3306 | MySQL, for GUI clients |

Each is overridable: `CDO_RAILS_PORT`, `CDO_APPS_PORT`, `CDO_FRONTEND_PORT`,
`CDO_DB_PORT`.

## Known limitations

- Bind-mount mode shares `dashboard/tmp`, `dashboard/log` and the build
  outputs with the host checkout. A Rails or webpack process running natively
  on the host at the same time will fight the container over them — run one
  or the other.
- 528 encrypted levels render hollow: `properties_encryption_key` is empty.
- The emulated S3 buckets start empty. Reads lazily populate a few of them
  (`lib/cdo/local_development/s3_emulation/`); everything else is missing
  rather than wrong.
- `yarn test:unit` needs `yarn build` to have run once — jest loads the
  locale bundles out of `apps/build`. Same as a native checkout.
- A dev apps build emits `en_us` only, so anything driving a lab page in
  another language fails locally — `tests/foundations/i18n.spec.ts` is the
  one to watch for.
- The first request after a code reload can 500 in the session store. The
  next one succeeds.
- The first `spring` command in a fresh container can die with a `mutex_m`
  default-gem conflict. `bundle exec spring stop` and run it again, or set
  `DISABLE_SPRING=1`.

## Related docs

- [SETUP.md](../SETUP.md) — native install
- [docker/README.md](../docker/README.md) — the image family
- [docker/developers/README.md](../docker/developers/README.md) — sidecars only, no container to work in
- [apps/README.md](../apps/README.md), [frontend/AGENTS.md](../frontend/AGENTS.md)
