# Devcontainer

A container you can develop this repo in: Rails, the apps webpack dev server,
the frontend Vite server, the test suites, the linters. One configuration, in
a codespace or on your own machine.

## What runs where

| | |
|---|---|
| `app` | [cdo-dev](../docker/dev/README.md), the development member of the [image family](../docker/README.md). Nothing starts by itself — you run Rails and the dev servers in a terminal. |
| `db` | [cdo-devdb](../.github/workflows/cdo-devdb-image.yml): `mysql:8.0` that carries both dashboard databases pre-seeded — development with curriculum, test prepared and seeded. You skip a two-hour `dashboard:setup_db`, and the test seed on first use. |
| `redis` | `redis:7`, stock. |
| `minio` | S3, emulated. A level page asks S3 whether its lesson has a PDF; without an endpoint that question is a 500. A one-shot `init` service creates the buckets. |

The gems come from the same `cdo-deps` layer the production image is built
on, so what you load in development is what production resolved.

## In a codespace

Create a codespace on your branch. If a prebuild is available it comes up in
about a minute; otherwise the first start also pulls the images, runs both
`yarn install`s, downloads the prebuilt apps package, and applies any
migrations newer than the database image.

```shell
bin/dashboard-server        # then open the forwarded port 3000
```

That is the whole setup. The clone in a codespace exists for the container
and nothing else, so there is nothing on the machine for it to collide with —
no native MySQL on 3306, no `locals.yml` from a previous life, no half-built
`apps/`.

Ports 3000, 9000 and 3036 are forwarded and labelled. The machine type comes
from `hostRequirements` in `devcontainer.json`: 8 cores, 16 GB, 64 GB of
storage, which is what the apps dev server and the two `node_modules` trees
actually need.

## On your own machine

Same `devcontainer.json`, same compose file. Give the container a clone of
its own — VS Code's "Dev Containers: Clone Repository in Container Volume",
or a directory you use for nothing else — and open it:

```shell
devcontainer up --workspace-folder <clone>
devcontainer exec --workspace-folder <clone> bash
```

or "Reopen in Container" from VS Code. Plain compose works too, and is what
to reach for when you want the stack without the devcontainer tooling:

```shell
docker compose -f .devcontainer/docker-compose.yml up -d
docker compose -f .devcontainer/docker-compose.yml exec app dev-bootstrap start
docker compose -f .devcontainer/docker-compose.yml exec app bash
```

Plain compose starts the containers and nothing else — there are no lifecycle
hooks to run the two halves for it. `dev-bootstrap start` is the one command
you owe it, on every start; `dev-bootstrap create` too, the first time, if you
want the git hooks and the apps package.

The images come from ghcr by default. To run images you built yourself:

```shell
docker build -t cdo-dev:local docker/dev/            # see docker/README.md
.devcontainer/preseed-db.sh                          # ~20 min, seeds a database
docker build -f .devcontainer/Dockerfile.db -t cdo-devdb:local .devcontainer
```

```
# .devcontainer/.env — compose reads it automatically, and it is gitignored
CDO_DEV_IMAGE=cdo-dev:local
CDO_DEV_DB_IMAGE=cdo-devdb:local
```

Everything compose reads, in one place — all of it optional, all of it from
`.devcontainer/.env`:

| variable | default | |
|---|---|---|
| `CDO_DEV_IMAGE` | `ghcr.io/code-dot-org/cdo-dev:latest` | the container you work in |
| `CDO_DEV_DB_IMAGE` | `ghcr.io/code-dot-org/cdo-devdb:latest` | the seeded database |
| `CDO_DEV_MINIO_IMAGE` | `minio/minio:latest` | S3 emulation, and the `init` job that creates its buckets |
| `CDO_LOCALS` | `./locals.yml.sample` | the file mounted at `/code-dot-org/locals.yml` |
| `CDO_RAILS_PORT` | `3000` | |
| `CDO_APPS_PORT` | `9000` | |
| `CDO_FRONTEND_PORT` | `3036` | the one most likely to collide, if you also run `yarn dev` natively |
| `CDO_APPS_STORYBOOK_PORT` | `9001` | |
| `CDO_DS_STORYBOOK_PORT` | `6006` | taken already if you run the design-system Storybook natively |
| `CDO_DB_PORT` | `13306` | MySQL, for GUI clients |

To make the clone the container works in, cloning from a checkout you already
have is much faster than cloning from GitHub — git hardlinks the objects, so
it costs about 12 seconds and ~2 GB rather than a full fetch:

```shell
git clone /path/to/your/checkout ~/src/cdo-devcontainer
```

### Using your everyday checkout instead, at your own risk

Pointing the container at a checkout you also build natively works, and the
two will fight over the build outputs they share. See [Sharing a checkout
with a native setup](#sharing-a-checkout-with-a-native-setup) for exactly
where, before you decide it is fine.

## Config

`locals.yml.sample` is mounted read-only over `/code-dot-org/locals.yml`, so
configuration comes from this directory. A fresh clone has no `locals.yml` at
all and needs none; a checkout that was also set up natively has one that
names a database this container cannot reach, and it is simply not used.
Nothing is copied and nothing is overwritten.

To change any of it, keep your own copy and point compose at it:

```shell
cp .devcontainer/locals.yml.sample .devcontainer/locals.yml
echo 'CDO_LOCALS=./locals.yml' >> .devcontainer/.env
```

Both are gitignored. Edit the file on the host and restart the container;
`locals.yml` is read once, at boot.

## Daily work

```shell
bin/dashboard-server                         # Rails on 3000
bundle exec rails console
bundle exec rake db:migrate
./bin/mysql-client-dashboard-writer "SELECT COUNT(*) FROM levels"
mysql -h db -uroot -ppassword
redis-cli -h redis ping

cd frontend && yarn install && yarn dev      # Vite on 3036
cd apps    && yarn install && yarn start     # webpack dev server on 9000
```

With Rails up, the Vite app is reachable through it at
`http://localhost-studio.code.org:3000/frontend-studio/`. Both Storybooks
work and their ports are forwarded: `yarn storybook` in `apps/` on 9001, and
in `frontend/apps/design-system-storybook/` on 6006.

`bin/mysql-client-dashboard-{reader,writer}` work as they do natively — the
mounted config gives them the `db` service and its credentials, and the mysql
client comes from the base image. They take SQL as a positional argument, not
behind `-e`.

### Tests and lint

```shell
bundle exec spring testunit test/models/concept_test.rb   # dashboard
cd apps     && yarn test:unit test/unit/gridUtilsTest.js  # apps
yarn workspace @code-dot-org/studio test src/routes/users # frontend, one path
cd frontend && yarn workspace @code-dot-org/e2e-tests test:ui:local
./tools/hooks/pre-commit
```

The test database arrives prepared and seeded — schema loaded, fixtures in,
`seed:test` already run — so a test command costs a Spring boot and nothing
else: about 26 s the first time in a fresh container, 1.4 s after that.
(Before the image carried a seeded test database, that first command paid
1 m 20 s, three quarters of it seeding.)

Three things to know before the first run:

- Dashboard controller tests need precompiled test assets, and Spring caches
  the manifest it saw at boot. Both halves, in this order:

  ```shell
  RAILS_ENV=test bundle exec rake assets:precompile
  bundle exec spring stop
  ```

  Skip the second and the tests still fail on assets "not present in the
  asset pipeline", against a manifest that is no longer on disk. This is not
  automated in `dev-bootstrap`: it costs a minute and a half, and it only
  matters if you run dashboard controller tests. Assets are workspace files,
  not database rows. Unlike the test database, no image can carry them.
- `yarn test:unit` needs `yarn build` to have run once — jest loads locale
  bundles out of `apps/build`.
- `pre-commit` lints **staged files only**. With an empty index it does
  nothing and exits 0, which is not a passing lint run; `git add` first.

The first `spring` command in a fresh container sometimes dies with a
`mutex_m` default-gem conflict, and it can wall `bin/rails` too.
`bundle exec spring stop` sometimes clears it; `DISABLE_SPRING=1` always
does, and is the escape hatch to reach for when a Spring-backed command will
not start at all.

### Developing in apps/

The container starts with `use_my_apps: false`, serving the prebuilt package
`dev-bootstrap create` downloaded: level pages render, but nothing you edit under
`apps/src` reaches the browser. To change that, on the host, take your own
config and flip the flag:

```shell
cp .devcontainer/locals.yml.sample .devcontainer/locals.yml
echo 'CDO_LOCALS=./locals.yml' >> .devcontainer/.env
sed -i 's/^use_my_apps: false/use_my_apps: true/' .devcontainer/locals.yml
```

then restart the container, and inside it:

```shell
bundle exec rake package:apps:symlink        # -> apps/build/package
bin/dashboard-server
cd apps && yarn start                        # writes as it compiles
```

Then browse port 9000 rather than 3000. It proxies everything it does not
serve to Rails, and reloads on save.


## Paths less traveled

Routines that work in here but are not set up for you. One caveat each,
because each one has exactly one thing that bites.

**Levelbuilder authoring.** Set `levelbuilder_mode: true` in your `CDO_LOCALS`
copy (`dashboard/config/environments/development.rb:78`). Authoring writes
`.level` and `.script` files into the mounted tree, so they show up in
`git status` on the host like any other edit, and many of them are behind LFS
— check `git check-attr filter -- <path>` before assuming a diff is text.
Reload one script into the database with
`bundle exec rake seed:single_script SCRIPT_NAME=express-2019`.

**Background jobs.** The development default is
`active_job_queue_adapter: :async` (`config/development.yml.erb:105`), which
runs jobs in the Puma process. PyCall-backed jobs — AI chat, podcasts,
rubrics — segfault under it. Set `active_job_queue_adapter: :delayed_job` in
your locals copy and run `bin/restart-active-job-workers`. Its pid files live
in `dashboard/tmp/pids` on the mount, so they outlive the container: after a
restart the stale-pid check aborts, and deleting them is the fix.

**The in-browser error console.** `better_errors` and `web-console` only
answer requests from 127.0.0.1, and requests reach this container from the
compose bridge instead, so the REPL on the error page silently does not
render. The stack trace still does. Widen the permitted IPs in a local
initializer if you need the console.

**Never `bundle exec rake install`.** The image is the install. That task
writes `.bundle/config` into the mounted tree, which then follows the
checkout onto the host and points its bundler at paths that exist only in
here.

**Playwright firefox and webkit** are not in the image — chromium only, which
is what the suite runs by default. `yarn exec playwright install --with-deps
firefox webkit` installs them in a running container (sudo is available) when
you are chasing an engine-specific failure. They do not survive a rebuild.

**Not supported here**, each for one concrete reason:

| | |
|---|---|
| Curriculum PDFs | `dashboard/lib/tasks/curriculum_pdfs.rake:27` wants a puppeteer install of its own. |
| `rake pseudolocalize` | Writes `dashboard/config/locales/*`, which is LFS-tracked; expect large diffs. |
| pegasus serving and tests | Deprecated, and needs `pdftk` and `enscript`, neither of which is in the image. |
| Selenium UI tests, Karma | Out of scope for this container. |

## Sharing a checkout with a native setup

Only if you took the at-your-own-risk option above. A codespace, a
clone-in-volume, or any clone the container has to itself has none of this.

The container and the host are then the same directory, and the build outputs
in it were written for one machine or the other:

| path | what happens |
|---|---|
| `dashboard/public/blockly` | A native build leaves an absolute symlink to a host path, which does not exist in the container. `dev-bootstrap create` says so and repoints it, which breaks it for the host; `bundle exec rake package:apps:symlink` on the host puts it back. Each side repoints it for the other, indefinitely. |
| `locals.yml` | Not shared, and that is deliberate — see Config. |
| `dashboard/public/assets` | Shared, and a native precompile's manifest does not match the container's. Symptom: controller tests erroring with an asset "is not present in the asset pipeline". Fix by precompiling in the container — `RAILS_ENV=test bundle exec rake assets:precompile` — which then makes the host's stale in the same way. |
| `dashboard/public/apps-package` | `dev-bootstrap create` downloads the prebuilt package over it, ~2 GB, whenever `blockly` does not resolve. It logs the commit_hash it replaced and the one it installed; the host's build is gone either way. |
| `apps/build` | Shared. Both sides write it; the last writer wins and neither notices. |
| `.git/hooks` | `dev-bootstrap create` symlinks the repo's hooks into place where nothing is installed. Harmless unless you keep hooks of your own there. |
| `apps/node_modules` | Shared. `yarn install` in the container rebuilds native packages against the container's toolchain, in the host's tree, without the lockfile changing. Reinstall natively after, or do not install on both sides. |

`dashboard/tmp` and `dashboard/log` are shared too, so a Rails or webpack
process running natively at the same time fights the container over pidfiles
and sockets. Run one or the other.

## Caches and teardown

### The database is scratch space

The image carries both databases: `dashboard_development`, seeded with
curriculum, and `dashboard_test`, prepared and seeded the way
`RAILS_ENV=test` needs it. Neither is built at container start. The server
runs with `--default-time-zone=+00:00`, which is SETUP.md's `SET PERSIST`
step made a property of the image rather than of a datadir that `down`
discards.

The `cdo-devdb` image carries the pre-seeded datadir, so each container
writes to a copy-on-write layer. `docker compose stop` and `start` keep those
writes. `down`, and rebuilding the container, throw them away: rows you
inserted, migrations you applied, test-database seeds. You come back to the
pre-seeded datadir, and `dev-bootstrap start` replays the missing migrations.
That costs a couple of minutes, not a reseed. Pre-seed again when the replay
stops being cheap.

The datadir sits at a path with no `VOLUME` declaration, so those writes are
in the container's own layer — but the `mysql:8.0` and `minio/minio` images
declare `/var/lib/mysql` and `/data`, and docker gives each container a fresh
anonymous volume for them. `docker compose down` leaves those behind; `down
-v` is what actually reclaims the space, and it is also what discards the
objects you uploaded to the emulated S3.

### Caches

yarn's global state is a named volume, because it is the one cache that
lives outside the checkout: without it the frontend workspaces refetch about
1.25 GiB every time the container is recreated. `apps/` keeps its cache in
the workspace (`enableGlobalCache: false`) and turbo keeps its own under
`frontend/.turbo`, so those two persist with the checkout and need nothing.

The volume is named by compose, which prefixes it with the project — one
cache per clone, not one per machine. That is deliberate: a machine-global
name means `docker compose down -v` in any unrelated project deletes the
cache this one just spent 1.25 GiB filling. Plain `down` keeps it; `down -v`
here deletes it along with the database and the emulated S3.

## Ports

| Host | Container | |
|------|-----------|---|
| 3000 | 3000 | Rails |
| 9000 | 9000 | apps webpack dev server |
| 3036 | 3036 | Vite |
| 9001 | 9001 | apps Storybook |
| 6006 | 6006 | Design-system Storybook |
| 13306 | 3306 | MySQL, for GUI clients |

Each is overridable — `CDO_RAILS_PORT`, `CDO_APPS_PORT`, `CDO_FRONTEND_PORT`,
`CDO_APPS_STORYBOOK_PORT`, `CDO_DS_STORYBOOK_PORT`, `CDO_DB_PORT` — which is
what you need if you also run any of these natively. A port already bound on
the host stops the container from starting at all, not just that one service.

## Known limitations

- 528 encrypted levels render hollow: `properties_encryption_key` is empty.
- The emulated S3 buckets start empty. Reads lazily populate a few of them
  (`lib/cdo/local_development/s3_emulation/`); everything else is missing
  rather than wrong.
- A dev apps build emits `en_us` only, so anything driving a lab page in
  another language fails locally — `tests/foundations/i18n.spec.ts` is the
  one to watch for.
- The first request after a code reload can 500 in the session store. The
  next one succeeds.
- The apps package `dev-bootstrap create` downloads is keyed on the content of
  `apps/`. A branch that changes `apps/` and has never been through CI has no
  package to download, and level pages need a local `yarn build` (or the
  dev-server flow above) instead.
- The database image is amd64 only, which is what Codespaces runs. On arm64,
  `preseed-db.sh` builds one natively.

## Related docs

- [SETUP.md](../SETUP.md) — native install
- [docker/README.md](../docker/README.md) — the image family
- [docker/developers/README.md](../docker/developers/README.md) — sidecars only, no container to work in
- [apps/README.md](../apps/README.md), [frontend/AGENTS.md](../frontend/AGENTS.md)
- [frontend/packages/e2e-tests/README.md](../frontend/packages/e2e-tests/README.md) — the Playwright suite
