---
title: Availability and configuration
description: DCDO, Gatekeeper, experiments, pilots, Rails environments, staff consoles, and the lifecycle of shipping a feature behind a flag.
type: concept
---

CodeAI uses several overlapping systems to control feature availability at runtime: DCDO for key-value flags, Gatekeeper for per-request conditional logic, experiments and pilots for user targeting, and feature modes for bundled emergency toggles.

## DCDO

DCDO (Dynamic Config, Data Operations) is the primary key-value flag store. In production, DCDO is backed by DynamoDB with an ElastiCache (Memcached) propagation layer and per-process in-memory caching (`DatastoreCache`). Each process refreshes its local cache from ElastiCache every 30 seconds.

Read a flag with:

```ruby
DCDO.get('my-flag-name', false)
```

The second argument is the default value. There is no central registry of defaults -- each call site provides its own, and **different call sites for the same key can disagree**. The codebase currently has roughly 99 teacher-and-student-facing DCDO keys. Known conflicts include:

- `browser-tts-button-enabled-locales` defaults to `['en-US', 'en']` in Ruby and `[]` in TypeScript.
- `student-snapshot-feedback-link` defaults to `false` in Ruby and `undefined` in JavaScript.
- `hoc_secret` defaults to `''` in one view and `nil` in another.
- `openai_http_read_timeout` defaults to `30` at most call sites but `20` at two nested fallbacks.

One key contains a typo that is now pinned: `lab2-fetch-level-proper0ties-by-lesson-id` (note the `0` in `proper0ties`) coexists with the correctly spelled `lab2-fetch-level-properties-by-lesson-id`. Both default to `true`. The typo key is in production use and cannot be renamed without coordination.

### Staff console

The DCDO console is at `/admin/dcdo`. Access requires authentication plus `authorize! :read, :reports`. Changes take effect at runtime within the 30-second cache-refresh window.

## Gatekeeper

Gatekeeper provides per-request conditional logic: it can gate a feature on a combination of user id, request host, country, and other attributes. Like DCDO, it is backed by DynamoDB and ElastiCache with the same `DatastoreCache` propagation mechanism.

The Gatekeeper console is at `/admin/gatekeeper`. Every write is logged to chat and takes about 30 seconds to propagate.

## Feature modes

A feature mode bundles several DCDO and Gatekeeper flags into one named toggle -- for example, an emergency high-load mode that disables expensive features at once. The console is at `/admin/feature_mode`.

The implementation is in `dashboard/lib/feature_mode_manager.rb`.

## Experiments and pilots

Experiments gate features to specific users. The `Experiment` model hierarchy under `dashboard/app/models/experiments/` supports several scoping strategies:

- `SingleUserExperiment` -- gates on a single user id.
- `SingleSectionExperiment` -- gates on a section id.
- `TeacherExperiment` -- gates on a teacher id (affects all their students).

A **Pilot** (`dashboard/app/models/experiments/pilot.rb`) is an `ApplicationRecord` (not an Experiment subclass) that names a group of users who opted in. The Pilot record has:

- `name` -- lowercase, hyphenated, used in URLs.
- `display_name` -- human-readable.
- `allow_joining_via_url` -- when true, users can join by visiting `http://studio.code.org/experiments/set_single_user_experiment/<name>`.

The pilot management console is at `/admin/pilots`. It requires `require_admin` (the `admin?` boolean, not just `:read, :reports`).

### Join-by-link

When a Pilot has `allow_joining_via_url: true`, the join URL is a GET request that deliberately mutates state so it can be a clickable link in an email. The corresponding leave URL is `GET /experiments/disable_single_user_experiment/<name>`. The experiments index at `GET /experiments` lets users view and leave their active experiments.

## Dynamic config viewer

A read-only view of the running configuration is at `/admin/dynamic_config`. It requires `authorize! :read, :reports`.

## Rails environments

Six environment files exist in `dashboard/config/environments/`:

| Environment | Purpose | Notes |
|---|---|---|
| `development` | Local development. | `cache_store: :null_store`, `active_job_queue_adapter: :async`. |
| `test` | Automated tests. | `active_job_queue_adapter: :test`. |
| `staging` | The staging deploy target; also the main branch name. | Sentry enabled, delayed_job adapter. |
| `production` | Production studio.code.org. | `cache_store: :file_store`. |
| `levelbuilder` | The curriculum-authoring environment. | Extends `staging.rb`, adds `cache_store: :null_store`. Levelbuilder tools are reachable only here, never on production. |
| `adhoc` | Short-lived environments for testing. | |

Per-environment configuration beyond the Rails files lives in `config/*.yml.erb` (for example, `config/production.yml.erb`). These ERB templates read secrets from `locals.yml` (local development) or environment-specific secrets stores. See `locals.yml.default` for the documented knobs.

`deployment.rb` at the repo root provides `rack_env?(:development, :staging, ...)` for environment checks in non-Rails code.

## Shipping a feature behind a flag

**Prerequisites:** You need `authorize! :read, :reports` (any user with the right CanCanCan ability) to use the DCDO and Gatekeeper consoles, and `admin?` (the boolean on the `users` table) to use the Pilot console. In local development, grant yourself admin with `./bin/rails runner 'User.find_by!(email: "you@test.xx").update!(admin: true)'` from `dashboard/`.

The standard lifecycle for a new feature:

1. **Add a DCDO flag defaulting off.** In your code, read `DCDO.get('my-feature', false)`. Pick one default and use it at every call site.

2. **Create a Pilot record** (if the feature needs opt-in users). Use the staff console at `/admin/pilots` to create a Pilot with `allow_joining_via_url: true`, then add users by email. In code, check whether a user is in the pilot:

   ```ruby
   SingleUserExperiment.enabled?(user: current_user, experiment_name: 'my-pilot')
   ```

3. **Distribute the join link.** Teachers receive `https://studio.code.org/experiments/set_single_user_experiment/<pilot-name>` in an email and join with one click.

4. **Flip the flag in DCDO.** Go to `/admin/dcdo`, set the key to `true`. The change propagates within 30 seconds.

5. **Monitor and kill-switch.** If load or errors spike, use a Gatekeeper rule or a feature mode to turn the feature back off immediately.

6. **Collapse the flag.** Once the rollout is complete, remove the `DCDO.get` call, delete the flag from the DCDO console, and remove any Pilot records.
