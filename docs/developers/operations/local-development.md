---
title: Local development
description: Run the Rails backend and the webpack dev server, configure locals.yml, and fix common local breakages.
type: task
---

Local development requires two servers (Rails and webpack) and a seeded MySQL database.

## Prerequisites

These instructions assume the repo is cloned and dependencies are installed per [SETUP.md](https://github.com/code-dot-org/code-dot-org/blob/staging/SETUP.md). Before starting the servers, confirm:

- Ruby and Bundler are installed and `bundle install` has been run in the repo root.
- Node.js (version in `.nvmrc`) and Yarn are installed and `yarn install` has been run in `apps/`.
- MySQL is running and the development database has been seeded (see "Seeding the database" below).
- `locals.yml` exists at the repo root (copy from `locals.yml.default` if missing).

## How the servers work

Two processes serve local development. Rails (Puma) handles the backend on port 3000. The webpack dev server proxies Rails and adds hot module replacement on port 9000. For frontend work, both must be running. Backend-only work needs only Rails.

## Start the servers

1. From the repo root, run `bin/dashboard-server`. This starts Puma on `http://localhost-studio.code.org:3000`.
2. From `apps/`, run `yarn start`. This starts the webpack dev server on `http://localhost:9000`, proxying to Rails.

Open `http://localhost:9000` for the full experience (React HMR), or `http://localhost-studio.code.org:3000` for Rails-only.

`localhost-studio.code.org` resolves to `127.0.0.1` through public DNS, not `/etc/hosts`. Bind to `127.0.0.1`, not the hostname string.

## Connect the apps build to Rails

Rails serves client-side assets from `dashboard/public/blockly`, which must be a symlink to `apps/build/package`.

1. Set `use_my_apps: true` in `locals.yml` (at the repo root).
2. Run `rake package:apps:symlink` from the repo root.
3. Restart the Rails server to pick up the change.

To verify the symlink: `ls -l dashboard/public/blockly` should point at `apps/build/package`. A branch switch or stash can silently revert the symlink; if your frontend changes stop appearing, run step 2 again.

## `locals.yml`

`locals.yml` holds per-machine configuration that overrides the values in `config/development.yml.erb`. It is gitignored. Common keys:

- `use_my_apps: true` -- serve your local apps build instead of the prebuilt package.
- API keys and secrets for OAuth, Clever, and other integrations live here when configured.

The default template is `locals.yml.default`.

## Seeding the database

A fresh database needs curriculum data and lookup tables before the app works correctly. From `dashboard/`:

```sh
RAILS_ENV=development bundle exec rake seed:default
```

This runs the full seed task list (curriculum scripts, courses, videos, schools, secret words, secret pictures, and more). It takes a long time on first run because it iterates every file in `dashboard/config/scripts_json/`. For a faster targeted reseed of one script: `bundle exec rake seed:single_script SCRIPT_NAME=<name>`.

If dashboard tests fail with missing-table or missing-seed errors, see the [testing page](/developers/operations/testing/) for the test-database setup commands.

## The rspack alternative

Appending `--rspack` to `yarn start`, `yarn build`, or `yarn build:dist` routes bundling through rspack instead of webpack. Startup is faster (seconds instead of minutes). This is opt-in while being evaluated; check your change under the default webpack build before shipping. See the [apps README](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/README.md) for memory and source-map options.

## Common local breakages

**Symlink reverted after branch switch.** Frontend changes no longer appear. Fix: `rake package:apps:symlink` and restart Rails.

**`yarn start` memory exhaustion.** The dev server can exceed available memory on large rebuilds. Options: `yarn start:cheap` (no source maps, type-checking on), `yarn start:cheapest` (no source maps, no type-checking), or `APPS_DEVTOOL=eval yarn start`.

**Missing Node version.** The docs site (`docs/site/`) requires Node >= 22.12.0 while the repo default is 20. Run `nvm use` inside `docs/site/` before working there.

**Spring stale state.** If a dashboard test gives an `Unable to autoload constant` error, run `spring stop` and retry.

**Level does not load (blank screen or "Script not seeded").** The development database is missing curriculum data for that level. Run `bundle exec rake seed:default` from `dashboard/` to seed all curriculum, or `bundle exec rake seed:single_script SCRIPT_NAME=<name>` for one script. A full seed takes several minutes on first run.

**`bin/dashboard-server` exits immediately.** Check that MySQL is running (`mysql -u root -e 'SELECT 1'`). Check `dashboard/log/development.log` for the error. A common cause is a missing or outdated `locals.yml`; copy `locals.yml.default` to `locals.yml` if you do not have one.

## Next steps

- [Testing](/developers/operations/testing/) -- run one test file or the full suite.
- [Test API and local accounts](/developers/operations/test-api-and-local-accounts/) -- create throwaway accounts for local testing.
- [Delivery](/developers/operations/delivery/) -- how commits reach production.
