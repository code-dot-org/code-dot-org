# Devcontainer

This is a container to develop this repo in, in a codespace or on your own
machine. It is the [docker/dev](../docker/dev/README.md) harness with two
additions, layered on by `docker-compose.yml`:

| | |
|---|---|
| `mysql` | [cdo-devdb](../.github/workflows/cdo-devdb-image.yml) in place of stock `mysql:8.0`. It carries `dashboard_development` seeded with the production curriculum, and `dashboard_test` prepared and seeded. |
| `minio` | S3, emulated, with the buckets Rails expects. |

Configuration is [docker/dev/dev.env](../docker/dev/dev.env). A `CDO_*`
variable outranks `locals.yml`, so the container needs no `locals.yml` and
ignores the database settings of one a native install left behind.

## Start

In a codespace, create one on your branch. On your own machine, give the
container a clone of its own, then use VS Code's "Reopen in Container" or:

```shell
devcontainer up --workspace-folder <clone>
devcontainer exec --workspace-folder <clone> bash
```

The first start runs both `yarn install`s. Every start runs `rake build`
with seeding and the apps build off. That downloads the prebuilt apps
package and applies the migrations newer than the database image.

```shell
bin/dashboard-server        # then open the forwarded port 3000
```

`hostRequirements` asks for 8 cores, 32 GB of memory, and 64 GB of storage:
the apps dev server, Rails, MySQL, and a test worker run at once.

To run images you built yourself, set `IMAGE` and `CDO_DEV_DB_IMAGE` in the
environment that starts the container:

```shell
docker build -f docker/dev/Dockerfile -t cdo-dev:local .
.devcontainer/preseed-db.sh                  # seeds a database, about 40 minutes
docker build -f .devcontainer/Dockerfile.db -t cdo-devdb:local .devcontainer
```

## Daily work

```shell
bin/dashboard-server                         # Rails on 3000
bundle exec rails console
./bin/mysql-client-dashboard-writer "SELECT COUNT(*) FROM levels"
mysql -h mysql -uroot
redis-cli -h redis ping

cd frontend && yarn dev                      # Vite on 3036
cd apps && yarn storybook                    # port 9001
```

```shell
bundle exec spring testunit test/models/concept_test.rb   # dashboard
cd apps     && yarn test:unit test/unit/gridUtilsTest.js  # apps
cd frontend && yarn workspace @code-dot-org/e2e-tests test:ui:local
./tools/hooks/pre-commit                                  # staged files only
```

- Dashboard controller tests need
  `RAILS_ENV=test bundle exec rake assets:precompile`, then
  `bundle exec spring stop`: Spring caches the asset manifest it saw at boot.
- `yarn test:unit` needs `yarn build` to have run once.
- If a Spring-backed command dies on a `mutex_m` conflict, run it with
  `DISABLE_SPRING=1`.

### Developing in apps/

The container serves the prebuilt apps package, so an edit under `apps/src`
does not reach the browser. To serve your own build, set
`CDO_USE_MY_APPS=true` in each shell, then follow
[docker/dev](../docker/dev/README.md#start-the-environment) from "Build the
apps files" and browse port 9000.

## The database outlives the container

The first start copies the image's datadir into the `mysql-data` volume.
`down` and rebuilding the container keep your writes, and each start
applies the migrations newer than the volume. To start over from the
latest pre-seed, delete the Codespace or run `docker compose down -v`.

## Known limitations

- Encrypted levels render hollow: `properties_encryption_key` is empty.
- The S3 buckets start empty. Reads populate a few of them
  (`lib/cdo/local_development/s3_emulation/`).
- A branch that changes `apps/` and has not been through CI has no apps
  package to download. The start command fails until you use the flow in
  "Developing in apps/".
- `better_errors` and `web-console` answer only 127.0.0.1, so the REPL on an
  error page does not render. The stack trace does.
- Do not run `bundle exec rake install`. It writes `.bundle/config` into the
  checkout.
- Only Playwright's chromium is in the image.
- A checkout you also build natively shares `apps/build`, `node_modules`,
  `dashboard/public` and `dashboard/tmp` with the container. Run one or the
  other.
- Not supported: curriculum PDFs, pegasus, Selenium UI tests, Karma.

## Related docs

- [SETUP.md](../SETUP.md): native install
- [docker/README.md](../docker/README.md): the image family
- [frontend/packages/e2e-tests/README.md](../frontend/packages/e2e-tests/README.md): the Playwright suite
