# Sinatra Port: Channels

Phase 2 of the Sinatra middleware port series (after
`sinatra-port-foundation`). Ports `ChannelsApi`
(`dashboard/legacy/middleware/channels_api.rb`) — project channel CRUD plus
policy-violation reads — to `Api::V1::ChannelsController`, and removes the
`ChannelsApi` middleware from the Rack stack. First phase that routes real
traffic through the foundation plumbing; also the first API on the lab2
critical path (`frontend/` project load/save needs channels + sources).

## Why

ChannelsApi is the smallest user-content middleware and the template port:
every pattern the later phases need (canonical + legacy alias routes, alias
CSRF exemption, Sinatra route deletion, legacy test translation) is
established here on ~11 routes backed by a single storage class (`Projects`).

## Decisions

- Strict parity per series decision: statuses, headers, bodies identical to
  Sinatra. Legacy tests `dashboard/legacy/test/middleware/test_channels.rb`
  and `test_channels_base64_error.rb` translate 1:1 and are the spec of
  record; the spec here pins only the load-bearing behaviors.
- One documented divergence: `POST create` answers `301` with a `Location`
  within the surface that received the request (`/v3/channels/<id>` on the
  alias, `/api/v1/channels/<id>` on the canonical route).
- Alias CSRF exemption pattern (reused by all later phases): thin
  `Api::V1::LegacyChannelsController < Api::V1::ChannelsController` containing
  only `skip_forgery_protection`; `/v3` routes point at it, `/api/v1` routes
  at the parent.
- The Sinatra class file survives this phase emptied of routes:
  `net_sim_api.rb` requires it and `files_api_test_base.rb` composes it. Full
  deletion happens in the final phase.

## What Changes

- New `Api::V1::ChannelsController < Api::V1::ProjectsApiBaseController`
  delegating to the existing `Projects` class (transport-first), covering:
  list, create, get, update (+ PATCH/PUT verb aliases), delete (+ legacy
  `POST :id/delete` alias), `privacy-profanity`, `share-failure`,
  `sharing_disabled`, `is_teacher_of_project_owner`, and the
  staging/development-only `debug` route.
- New routes: canonical under `namespace :api do namespace :v1`, aliases under
  `scope path: '/v3'` (adjacent to the existing ReportAbuse `/v3` scope).
- **BREAKING for the middleware only**: all routes deleted from
  `channels_api.rb`; `ChannelsApi` removed from the middleware stack in
  `config/application.rb`. URLs, clients, and CDN config are unaffected — the
  alias routes serve the same paths with the same behavior.
- Legacy `test_channels*.rb` deleted after translation;
  `files_api_test_base.rb` switches channel creation from
  `POST /v3/channels` (Rack) to direct `Projects.new(...).create` so the
  remaining FilesApi legacy tests no longer depend on ChannelsApi routes.

## Capabilities

### New Capabilities

- `sinatra-port-channels-api`: the channels HTTP surface — CRUD, verb
  aliases, policy-violation reads — with legacy-parity semantics on both
  route surfaces.

### Modified Capabilities

None (foundation capabilities are consumed, not changed).

## Impact

- `dashboard/app/controllers/api/v1/channels_controller.rb` (+ thin legacy
  subclass), `dashboard/config/routes.rb`, `dashboard/config/application.rb`
  (stack removal), `dashboard/legacy/middleware/channels_api.rb` (routes
  deleted), new tests under `dashboard/test/integration/`.
- Clients (`apps/src/code-studio/initApp/clientApi.js`, `project.js`,
  `apps/src/lab2/projects/channelsApi.ts`): no changes required; lab2 may
  adopt `/api/v1/channels` afterward.
- Requests to `/v3/channels*` now traverse the full Rails stack (session,
  router) instead of short-circuiting in middleware; foundation's filter
  skips keep the delta to routing overhead.
