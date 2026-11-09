# Golden-fork devcontainers

## Why

Setting up a code-dot-org dev environment takes 30+ minutes of babysat bootstrap
(>10 min of it seeding curriculum into MySQL), produces exactly one mutable
environment per machine, and cannot be safely handed to an autonomous coding
agent because the developer's AWS credentials are ambient. Eleven measured
experiments (A–G, H-B/C/D, 2026-07-11/12) prove a better shape is buildable:
a pre-seeded MySQL datadir baked into an image layer forks copy-on-write into
an isolated, credential-free sandbox in under one second, and a complete
"idea → working environment" flow lands in ~4 seconds. No prior art in the
wild ships this for MySQL; the enabling patterns (materialized datadir,
prebuild-then-fork, worktree-per-agent) are each individually corroborated.

## What Changes

- Two registry images, built by GHA with content-hash triggers (the
  `lib/cdo/test_run_utils.rb` pattern): `cdo-dev-base` (ruby-slim toolchain +
  gems + yarn caches, lockfile-keyed layers) and `cdo-dev-db` (`mysql:8.0`
  multiarch + seeded datadir at a non-VOLUME path, seeded by the image's own
  mysqld). The repo is never shipped in an image; git is the delta channel.
- A local **golden refresh**: once daily (plus on lockfile change and on
  demand), a background job catches the local golden images up to staging
  (fetch, bundle reconcile, migrate, incremental reseed) and re-bakes a single
  local layer. Refresh failures are never committed; the last good golden
  keeps serving forks (verified: poisoned-migration test, H-C).
- A **sandbox CLI** (`bin/sandbox`): `new/rm/ls/refresh/snapshot` — fork
  golden + `git worktree add` per sandbox (~4 s measured), compose trio
  (app + db + redis), persona profiles (`--rails`, `--frontend`, `--apps`,
  `--fullstack`) with curated defaults (memory limits, tmpfs shadow-mounts
  over `dashboard/tmp` and `dashboard/log`, WAL-on-tmpfs shim, `/etc/hosts`
  glue, inotify floors).
- **devcontainer-spec integration**: a `devcontainer.json` per persona so VS
  Code, Cursor, and devcontainer-native agent harnesses consume the same
  sandboxes (`postStartCommand` service startup — the CLI replaces ENTRYPOINT).
- **Sandboxes are zero-credential and can run fully offline** (`--network=none`
  verified after one bake fix): no AWS credentials exist inside; S3 is MinIO;
  secrets are inert placeholders.
- A **DevEx verification suite**: automated checks that the promised
  experience holds, per persona and per angle (creation latency budget,
  edit-loop budgets, staleness catch-up, churn/leak, offline, isolation,
  disposability), run in CI against the nightly images and locally on demand.
- Phase-0 repairs in the app itself, each independently valuable: seed
  whole-input hash guard (a no-op reseed drops from ~75 s to ~13 s, measured),
  Spring/`mutex_m` conflict fix (single-test loop 44 s → sub-second, the
  largest single DevEx lever found), root `.dockerignore`, and two bug fixes
  (Zeitwerk `Cdo::Aws` shadowing of `::Aws`; `analytics_exportable.rake`
  making a live Secrets Manager call on every dev `db:migrate`).

## Capabilities

### New Capabilities
- `sandbox-images`: the two registry images — contents, layer keying,
  multi-arch (amd64/arm64), bake procedure (seed-with-own-mysqld, clean
  shutdown, LFS-verified tree, offline-complete venv), rebuild triggers.
- `golden-refresh`: local refresh orchestration — triggers, the 7-point
  commit checklist, never-commit-failures fallback, single-layer re-bake
  (no commit-chain growth).
- `sandbox-cli`: sandbox lifecycle, worktree management, persona profiles
  and their curated defaults, port publishing, snapshot.
- `devcontainer-integration`: devcontainer.json per persona, service startup
  hook, editor/agent-harness compatibility.
- `devex-verification`: the measurable DevEx contract — budgets and automated
  verification for every persona and angle.
- `seed-hash-guard`: whole-input content-hash short-circuit for
  `seed:default`, including the currently-unguarded `course_offerings`.

### Modified Capabilities
<!-- none: no existing specs in openspec/specs/ cover these areas -->

## Impact

- New: `tools/sandbox/` (CLI + refresh orchestrator), `.devcontainer/`,
  `.github/workflows/` bake lanes, `.dockerignore`.
- Modified: `dashboard/lib/tasks/seed.rake` (hash guard), `Gemfile`/boot
  (Spring fix), `lib/cdo/secrets.rb` or `lib/cdo/aws` layout (Zeitwerk fix),
  `dashboard/lib/tasks/analytics_exportable.rake` (dev-migrate hook).
- Unchanged: production images, k8s/Skaffold, Drone CI, `docker/developers/`
  compose (remains valid for native-server workflows).
- Known constraints carried into design: encrypted levels seed hollow without
  `properties_encryption_key` (528 levels); MinIO buckets start empty;
  `RAILS_ENV=test` prep and pegasus are deferred; real M-series hardware
  validation is an explicit early milestone, not an assumption.
