---
title: System overview
description: The Rails monolith, Sinatra middleware, frontend bundles, and how a request flows through the CodeAI platform.
type: concept
---

CodeAI (studio.code.org) is a Rails monolith with several layers in front of it and beside it.

## The Rails monolith

`dashboard/` is a conventional Rails app: 241 controllers, 350 models, 940 migrations, and a 3133-line `schema.rb`. Three mounted engines (`cdo_contentful`, `hoc_legacy`, `observability`) extend it without touching the core app directory. The session cookie is `_learn_session` with `domain: :all`, which is what makes sign-in shared across all `.code.org` subdomains.

Authentication uses Devise with five OmniAuth providers. Authorization uses CanCanCan. For details on both, see [Authentication and authorization](/developers/platform/authentication/).

One fact trips up newcomers: the `stages` database table is the `Lesson` model. There is no `Stage` model.

## Sinatra middleware

Six legacy Sinatra apps are mounted as ordered Rack middleware ahead of the Rails router. They serve the project storage, file, animation, sound, and network-simulation APIs that predate the Rails controller layer.

The insertion order in `dashboard/config/application.rb` is:

1. `FilesApi`
2. `ChannelsApi`
3. `SharedResources`
4. `NetSimApi`
5. `AnimationLibraryApi`
6. `SoundLibraryApi`

These sit after `Rails::Rack::Logger` and the i18n middleware but before `ActionDispatch::ShowExceptions`. That ordering matters: a Sinatra app that raises or returns a non-200 status is not wrapped by the Rails exception handler. A past production incident (PR #75089) demonstrated that a Sinatra app positioned below `ShowExceptions` turned Rails 404 and 422 responses into bare 500s invisible to Sentry. See `dashboard/legacy/README.md` for the conventions around this code.

## Repo-root lib/ and shared/

Ruby code and static assets that predate the split between dashboard and pegasus live at the repo root:

- `lib/cdo/` -- the `CDO` global config-accessor object, plus subdirectories for AWS, i18n, poste (email), and other integrations.
- `lib/dynamic_config/` -- DCDO and Gatekeeper implementations backed by DynamoDB in production (see [Availability and configuration](/developers/platform/availability-and-configuration/)).
- `lib/cron/` -- currently only `aurora_backup.rb`; most scheduled work runs through Chef cron (see [Background jobs](/developers/platform/background-jobs/)).
- `shared/middleware/` -- the `SharedResources` Sinatra app.
- `shared/` -- cross-app static assets (CSS, fonts, images, partials) and shared Haml templates.

`deployment.rb` at the repo root is required before Rails boots. It wires environment detection (`rack_env?`) and loads the `CDO` object.

The boundary between `lib/` (Ruby code) and `shared/` (static assets and middleware) is convention, not enforced by tooling. Some of the split exists to serve pegasus, the older Sinatra CMS at code.org (not studio.code.org). Pegasus shares the dashboard database and the `.code.org` session cookie, which is the only reason studio developers need to know it exists. A removal plan is in progress.

## The apps/ webpack bundle

`apps/` is a single large webpack bundle containing the client-side code for every lab (App Lab, Game Lab, Music Lab, Dance Party, and many others), the teacher dashboard React views, and shared infrastructure like the localization layer. It has roughly 220 entry points defined in `apps/webpackEntryPoints.js`.

Rails views mount a specific entry by referencing its webpack asset path. The bundle is served from `dashboard/public/blockly`, which is a symlink to `apps/build/package` when `use_my_apps: true` is set in `locals.yml`. In production, the build output is deployed as a static asset package behind CloudFront.

An rspack opt-in (`yarn start --rspack`) provides a faster dev-server rebuild cycle. See `apps/README.md` for build commands and source-map options.

## The frontend/ Turborepo

`frontend/` is a Yarn workspaces monorepo managed by Turborepo. It contains 19 packages and 3 apps:

- **Packages used in production today** (linked into the `apps/` bundle via `portal:` deps): `component-library`, `component-library-styles`, `core`, `fonts`, `markdown`, `lesson-deep-dive`, `ailab`.
- **Packages used only in the gated frontend-studio shell**: `labs` (music lab port), and the `localization` plugin inside `core`.
- **Apps**: `studio` (the new SPA shell, mounted at `/frontend-studio/*`), `design-system-storybook`, `mobile`.

The `/frontend-studio/*` route is gated by the DCDO flag `frontend_studio_enabled`, which defaults to `true` everywhere except production (where it defaults to `false` and returns 404). Production traffic does not reach the frontend-studio shell today.

See `frontend/AGENTS.md` and `frontend/README.md` for workspace commands and conventions.

## Three asset pipelines

Three asset pipelines coexist:

1. **Sprockets** -- the Rails asset pipeline (forked). Handles SCSS, legacy JS, and static assets under `dashboard/app/assets/`.
2. **Webpack** -- the `apps/` bundle. Produces the lab and teacher-tool JavaScript served from the `blockly` symlink.
3. **Vite** -- serves the `frontend/apps/studio` shell behind the `frontend_studio_enabled` flag.

In production, CloudFront sits in front of all three. `config.assets.gzip = false` in `application.rb` because CloudFront compresses on the fly.

## Where state lives

| Store | What it holds | Shared across servers? |
|---|---|---|
| MySQL (Aurora) | Users, sections, progress, levels, curriculum config, delayed_job queue, poste deliveries | Yes |
| Redis | Sessions (`RedisSessionStore`) | Yes |
| DynamoDB | DCDO and Gatekeeper flag values | Yes |
| S3 | Project source blobs, uploaded files, animations, sounds | Yes |
| Per-server file cache | `Rails.cache` (`ActiveSupport::Cache::FileStore` in production, `NullStore` in development) | No -- each app server has its own |
| ElastiCache (Memcached) | Shared DCDO/Gatekeeper propagation cache | Yes (in production) |

`Rails.cache` being a per-server file store is the single most important caching invariant: anything that assumes a shared cache is wrong.

## How a request flows

A browser request to `studio.code.org` follows this path:

1. **CloudFront** -- serves cached static assets; forwards dynamic requests to the ALB.
2. **ALB** -- routes to a Puma app server.
3. **Rack middleware** -- in order: CORS, session cookie migration, cookie-based DCDO, logging, i18n, Global Edition, then the six Sinatra apps.
4. **Sinatra** -- if the URL matches a Sinatra route (for example, `/v3/channels/*`), the Sinatra app handles it and the request never reaches Rails.
5. **Rails** -- `ActionDispatch::ShowExceptions`, session, CSRF, Warden/Devise authentication, then the Rails router dispatches to a controller.
6. **Controller** -- loads models, checks authorization via CanCanCan, renders a view.
7. **View** -- an HTML page that typically boots one webpack entry from `apps/` via a `<script>` tag pointing at `blockly/js/<entry>.js`.
8. **Client** -- the webpack bundle initializes, reads `window.appOptions` (a JSON blob the view rendered inline), and mounts the lab or teacher-tool UI.

For level pages specifically, `LevelsHelper#app_options` builds the `appOptions` blob with level metadata, section context, user preferences, and active experiments. See [How a level loads](/developers/labs/how-a-level-loads/) for the full contract.
