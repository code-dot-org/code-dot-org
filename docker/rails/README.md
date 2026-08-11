# cdo-rails

`cdo-deps` plus the Rails source tree, sliced down to what the api and worker
roles read at boot or at request time. The Dockerfile is three instructions:
`FROM cdo-deps`, `COPY` the slice, recreate `dashboard/log` and `dashboard/tmp`
(Rails requires both directories to exist at boot, and the dockerignore drops
them along with their contents).

It sets no `CMD`. The caller supplies the command; see
[Running it](#running-it).

The image is schema-capable but not schema-responsible: `db/schema.rb` and
`db/schema_cache.yml` ship, the migration history and `db/seeds.rb` do not, so
`db:schema:load` works from the image and `db:migrate` does not.

## What is in the slice

The Rails source tree, minus what the api and worker roles never read. The
Dockerfile copies the build context, so `Dockerfile.dockerignore` is the
slice: an allowlist that denies everything, re-includes the directories and
root files Rails boot reads, then carves out the exclusions in labelled
groups. Its comments also record the inclusions that look excludable and
are not, which is what to read before dropping a path.

Because it is an allowlist, a new top-level directory in the repo cannot
join the image without an edit here.

## Build

The build context is the repo root; the Dockerfile is selected with `-f`.

```
git lfs pull --include='dashboard/config/locales/**'
docker build -f docker/rails/Dockerfile \
  --build-arg DEPS_IMAGE=cdo-deps:local \
  -t cdo-rails:test .
```

The LFS step is not optional. `dashboard/config/locales/**` is git-LFS tracked
and neither a plain clone nor `actions/checkout` fetches LFS objects, so
without it the image bakes pointer files and Rails dies at boot on the first
non-English locale. `.gitattributes` exempts `*en.yml` and `*en.json` from LFS,
so an English-only check will not catch it — the smoke test parses `ar-SA.yml`
for exactly this reason. Locales are the only LFS-tracked path inside the
slice, which is why the pull is by pattern rather than wholesale.

`DEPS_IMAGE` names the dependency layer to build on. Building by hand, either
build one (see [docker/deps/README.md](../deps/README.md#build)) or pull
`ghcr.io/code-dot-org/cdo-deps:latest`. What matters is that its lockfile
inputs match this checkout; a mismatch surfaces as an unresolvable bundle. CI
picks the parent by digest instead, off a content key, and needs no tag —
see [Published image](#published-image).

Podman builds the same command line. The dual-engine constraints described in
[docker/base/README.md](../base/README.md) apply here too.

## Test

Two suites, in increasing cost.

`smoke-test.sh` is database-free. It runs the image with a series of one-off
commands and asserts the slice is what it should be: `bundle check` passes,
`deployment.rb` loads (which exercises the CDO config cascade and `lib/`),
`cdo/pycall` initialises libpython through the venv, the staging gem set loads,
the kept paths above are present, and no toolchain came along.

```
./docker/rails/smoke-test.sh cdo-rails:test docker
./docker/rails/smoke-test.sh cdo-rails:test podman
```

`verify.sh` boots the artifact against real MySQL and Redis and drives it
through each interaction model it ships for. Orchestration is `compose.yaml`,
configuration is `adhoc.env`, and the phase payloads are in `verify/`; the
script only sequences and asserts.

```
./docker/rails/verify.sh cdo-rails:test docker
./docker/rails/verify.sh cdo-rails:test podman
```

| phase | what it proves |
|---|---|
| `db:schema:load` | the schema in the image builds a usable database |
| create a teacher via `rails runner` | model writes work end to end, through Devise and validations |
| enqueue an ActiveJob and `Delayed::Worker#work_off` it | the worker role. A real job is enqueued because `work_off` on an empty queue cannot fail |
| `/get_token` → Devise sign-in → `/api/v1/users/current` | the api role over HTTP, with a Redis-backed session |

Each run uses a per-invocation compose project name, so concurrent runs do not
collide, and tears its stack down on exit.

## Running it

`compose.yaml` is also the local-run recipe. It needs `IMAGE` set, and it
starts the web service the way the production systemd unit does: working
directory `dashboard/`, `bundle exec puma -C config/puma.rb`. Bind address and
worker count come from `config/puma.rb` via CDO, which defaults to
`0.0.0.0:3000`.

```
export IMAGE=cdo-rails:test
cd docker/rails

docker compose up -d --wait mysql redis
docker compose exec mysql mysql -uroot \
  -e 'CREATE DATABASE dashboard_adhoc; CREATE DATABASE pegasus_adhoc;'
docker compose run --rm --no-deps web bundle exec rails db:schema:load
docker compose up -d --wait web
docker compose port web 3000     # the host port compose assigned
```

A one-off command in the same environment:

```
docker compose run --rm --no-deps web bundle exec rails runner 'puts User.count'
```

`adhoc.env` supplies the configuration. It runs `RAILS_ENV=adhoc`, points the
database and Redis settings at the compose services, and sets a stub for every
value `config/adhoc.yml.erb` declares as a secret.

### How the configuration works

`CDO_*` environment variables are the highest-priority configuration source,
above `locals.yml`, `globals.yml`, and the per-environment ERB files. `CDO_FOO`
sets the config key `foo`.

Two consequences worth knowing before editing `adhoc.env`:

- A `CDO_*` variable whose key has no default in `config.yml.erb` aborts boot
  with "Property or properties ... defined in the environment without a default
  specified in `config.yml.erb`". Typos fail loudly, which is the good case.
- `config/adhoc.yml.erb` declares database endpoints, credentials, and API keys
  with `!Secret` and `!StackSecret` tags, which resolve through AWS Secrets
  Manager. Setting the matching `CDO_*` variable pre-empts the declaration, so
  the lookup never happens. That is what the stub block in `adhoc.env` is for.
  `AWS_EC2_METADATA_DISABLED=true` stops the AWS SDK probing the instance
  metadata endpoint on top of that.

`SKIP_SCRIPT_PRELOAD=1` disables the curriculum preload initializer, which has
nothing to preload here, since the curriculum is not in the slice.

`CDO_NO_HTTPS_STORE=true` is load-bearing for anything that signs in. Sessions
are stored in Redis and keyed by a cookie that is marked `secure` unless this
is set; over plain HTTP the client discards it, sign-in appears to succeed, and
every following request is anonymous.

## Things that will bite

**Puma's logs are not on the container's stdout.** In every environment except
development, `config/puma.rb` redirects stdout and stderr to
`dashboard/log/puma_stdout.log` and `puma_stderr.log`. `docker logs` shows only
the output from before the redirect takes effect. For anything after boot:

```
docker compose exec web tail -f log/puma_stdout.log
```

**`RAILS_ENV=production` does not boot locally.** DCDO selects its DynamoDB
adapter on the production branch, so a production boot needs live AWS by code,
not merely by configuration. `adhoc` and `staging` are the environments this
image can be booted in locally.

**Redis is not optional.** With no reachable Redis the session store fails on
any request that touches a session.

**Nothing regenerates the slice.** The dockerignore is a list of paths. Moving
a runtime-read file into an excluded directory, or adding a top-level
directory that Rails reads at boot, produces an image that builds and smoke
tests clean and fails at request time. Extend the smoke test's presence checks
when you add something the running app reads from disk.

## Published image

`ghcr.io/code-dot-org/cdo-rails`, amd64 only.

| tag | published from | meaning |
|---|---|---|
| `git-<sha>` | staging | the commit that published |
| `latest` | staging | most recent staging publish |
| `dev-<sha>` | other branches | manual dispatch |

`git-<sha>` names the source a publish built, but publishes happen on
image-definition changes and on the `cdo-deps` chain, not on every staging
commit, so most shas never get a tag. Do not treat the tag set as a per-commit
contract.

`.github/workflows/cdo-rails-image.yml` runs the smoke matrix on docker and
podman, runs `verify.sh`, and publishes from staging. It is not triggered by
source changes — only by changes to this directory, to the key action, or to
the workflow, plus the chain from `cdo-deps-image` and manual dispatch. The
publish job re-runs both suites against the bytes it is about to push, because
the earlier jobs tested images built on other runners.

The workflow resolves `cdo-deps` by the content key its own checkout implies
and fails, loudly, if no such layer has been published. Rebase onto the staging
push that published the dependency layer; do not reach for `latest`.
