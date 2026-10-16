# Design: golden-fork devcontainers

All numbers cited below were measured in experiments A–G and H-B/C/D
(2026-07-11/12) on Linux/amd64 unless marked otherwise. Dockerfiles,
entrypoints, compose files, and raw logs from those experiments are the
reference implementations.

## Context

Today's dev environment is a pet: one native checkout, one shared mutable
MySQL, 30+ min bootstrap, no isolation between concurrent work, ambient AWS
credentials. The seed's incremental cache lives in DB columns (`scripts.md5`,
`DSLDefined.md5`), so a fresh database always pays the full ~18 min seed;
only a materialized database short-circuits it. The org already caches a
seeded `/var/lib/mysql` in CI (`.drone.yml` cache-staging-build) and
content-hash-keys seeded dumps (`lib/cdo/test_run_utils.rb`) — but never for
dev, and never as fork-per-sandbox.

Change cadence on `origin/staging` (84-day window): curriculum every workday
(59/84 days), `Gemfile.lock` ~weekly (13), `frontend/yarn.lock` ~every 3 days
(27), `schema.rb` ~2×/week (18), toolchain ~quarterly. Any registry-refresh
cadence is therefore either a daily multi-GB download or permanent staleness —
unless freshness is produced locally.

## Goals / Non-Goals

**Goals:**
- Sandbox creation in seconds (budget: ≤10 s; measured today: ~4 s), always
  current to the machine's last golden refresh.
- N concurrent sandboxes per machine, fully isolated (DB, ports, tmp, logs),
  disposable without regret.
- Zero credentials and (option) zero network inside sandboxes.
- Near-zero recurring downloads: git deltas daily; images only when lockfiles
  or schema actually change.
- Same sandboxes serve humans (VS Code/devcontainer) and autonomous agents.
- The DevEx contract is enforced by an automated verification suite, not by
  hope.

**Non-Goals:**
- Replacing production/k8s images, Drone CI, or `docker/developers/` compose.
- Pegasus serving, `RAILS_ENV=test` full prep, encrypted-level content,
  pre-populated MinIO buckets (all deferred; documented degradations).
- Windows hosts (devcontainer spec covers it in principle; not validated).

## Decisions

### D1. Fork mechanism: baked datadir at a non-VOLUME path, overlayfs CoW
The seeded datadir is baked into `cdo-dev-db` at `/opt/mysql-data`. A fork's
mysqld serves in 0.78–0.9 s; 15-cycle churn is flat at 721–869 ms; writes are
isolated; kill -9 damage dies with the container layer (fresh fork 785 ms).
- *Never* bake under `/var/lib/mysql`: the official image's VOLUME
  declaration copies the datadir to an anonymous volume per start (~7 s/GB).
- Clean shutdown at bake is mandatory (dirty datadir = +4 s crash recovery
  per boot; corruption reports in the wild all involve committing a live
  mysqld — never a cleanly-shut-down bake).
- Alternatives considered: reflink/btrfs volume clones (block-level CoW,
  eliminates copy-up entirely; direct prior art exists) — rejected for v1
  because it adds a host-filesystem requirement; kept as a documented v2
  option. MySQL CLONE plugin per fork — rejected: physical copy, strictly
  slower than CoW; its role is snapshot production at bake time.

### D2. The copy-up wart and its shipped mitigations
overlayfs copy-up is file-granular; mysqld's O_RDWR opens copy ~1.7 GB into
each fork's layer lazily (start latency unaffected). Shipped mitigations,
both measured:
- WAL shim at container start: copy `#innodb_redo` + `undo_00{1,2}` (~148 MB)
  to tmpfs, then `rm` the originals (overlayfs whiteout). 3× writable-layer
  reduction (234 MB → 78 MB under a 10k-row workload), +~0.4 s start. Bare
  `--innodb-log-group-home-dir`/undo relocation flags hard-abort on an
  existing datadir; the copy+whiteout protocol is the mechanism.
- Dev-only durability flags on forks: `--skip-log-bin --mysqlx=OFF
  --innodb-flush-log-at-trx-commit=0 --skip-innodb-doublewrite
  --innodb-buffer-pool-size=256M` (binlog off also shrinks the bake ~1.1 GB).

### D3. DB sidecar, not baked-in mysqld
`cdo-dev-db` = `mysql:8.0` (Docker Official; verified multiarch amd64+arm64)
plus the datadir layer. The seed runs under the image's own mysqld, so server
and datadir versions match by construction — InnoDB refuses downgrade
(verified: an 8.0.46 datadir aborts Oracle's frozen 8.0.32 `mysql/mysql-server`
image with "Cannot boot server version 80032 … Downgrade is not supported").
Sidecar keeps DB updates from invalidating toolchain layers and vice versa.
Redis is the stock `redis` image. Compose is the composition layer; the
devcontainer spec supports it natively.

### D4. The repo never ships in an image
One local clone volume per machine (populated once: clone 7 s + LFS 5 s from
a local source; from GitHub, shallow-clone with background unshallow), then
`git worktree add` per sandbox (3.3–7 s + LFS). Git is the delta channel;
daily downloads round to zero. Rationale: repo tree and apps-build layers are
the two biggest AND most volatile artifacts (6.3 GB + 7.2 GB in experiment E's
25.1 GB fat image) — shipping them nightly is what made the fat image a dead
end. The fat image remains an option for LAN-fast cloud runners only.
- Worktree gotchas owned by the CLI: a worktree's `.git` is a pointer file
  (clone+worktrees must live in one volume); LFS must smudge from the local
  store (`git -c remote.origin.url=file://… lfs pull`; `lfs.storage` on a
  read-only mount fails — git-lfs writes tmp/logs under it); the CLI verifies
  the `git-lfs` binary exists before any checkout (its absence breaks
  worktree creation, twice observed).

### D5. Golden refresh: local, background, never-commit-failures
A refresh = fetch + `bundle check || bundle install` + `db:migrate` +
`seed:default` + smoke checks, executed in a container against the current
golden, then re-baked as a single replaced local layer (tar + ADD ≈ 5 s).
Not `docker commit` chaining: copy-up makes each commit +1.65 GB regardless
of logical change (measured; 30 days ≈ +50 GB).
Commit checklist (all required, verified by the poisoned-migration test):
migrate exit 0; seed exit 0; `mysqladmin ping` + redis PING; smoke query on
seeded models (`Unit.count > 0`); `db:migrate:status` shows no `down` rows
(MySQL DDL is non-transactional — a failed migration leaves applied DDL with
no schema row; naive rerun then collides); clean mysqld shutdown. On any
failure: discard the container, keep last-good, surface the error. Concurrent
refresh does not disturb running forks (verified, 116/117 workload ticks).
Triggers: scheduled (daily), lockfile/schema change detected on fetch, and
on demand — the Codespaces-prebuild trigger vocabulary.
- Staleness economics: catch-up cost is dominated by fixed overhead, not
  drift (identical-commit reseed ≈ 75 s; a 3-week-stale golden showed a
  0-gem bundle delta at the old side). The seed hash guard (D8) cuts the
  no-op case to ~13 s of Rails boot.

### D6. Persona profiles are the product surface
`bin/sandbox new <name> [--rails|--frontend|--apps|--fullstack]`:
- `--rails`: base + db + redis, plus the prebuilt apps static bundle layer —
  without it every lesson-plan page 500s… twice over: pages need
  `/blockly/*` assets AND live S3 HEADs for lesson PDFs, so MinIO (with the
  k8s job's 10-bucket list pre-created) is part of this profile. Verified:
  real level pages 200 in ~16 s from `docker run` (experiment E).
- `--frontend`: node image (1.66 GB) with warm Yarn Berry cache
  (`YARN_GLOBAL_FOLDER` — not `YARN_CACHE_FOLDER`, which Berry's
  enableGlobalCache silently ignores; `COREPACK_HOME` pinned). Default MSW
  mode (no Rails): `yarn install --immutable` ~12 s on a fresh worktree,
  HMR 53–67 ms, vitest re-run 846 ms, Storybook 11.3 s, warm turbo typecheck
  0.5 s (cache in-tree, survives container swaps).
- `--apps` / `--fullstack`: full stack in one sandbox. Curated defaults from
  measurement: `yarn start:cheapest` (SKIP_TYPECHECK is the −6–7 GB lever),
  memory limit 12 GB floor / 16 GB comfortable (8 GB OOM-kills default
  `yarn start` instantly), `fs.inotify.max_user_watches ≥ 524288`,
  `127.0.0.1 localhost-studio.code.org` in `/etc/hosts` (both the webpack
  devserver proxy and vite-rails detection key off it). Vite-Rails
  integration mode verified: Rails transparently proxies `/frontend-studio/`
  to the vite dev server, sub-second HMR, ~1 GB — the measured order-of-
  magnitude argument for the apps→frontend migration.
- Per-sandbox isolation on shared trees: tmpfs shadow-mounts over
  `dashboard/tmp` AND `dashboard/log` (validated under 6-way load; Rails has
  no env hook for either — mount shadowing is the mechanism).

### D7. Zero-credential, offline-capable sandboxes
`aws_s3_emulated: true` is mandatory (without it an AI-rubric S3 validation
aborts `seed:scripts`); with it, zero S3 connections are attempted.
`AWS_EC2_METADATA_DISABLED=true` baked. Secrets resolve lazily and are inert
placeholders. Full `--network=none` operation verified after one bake fix:
`uv sync` must install workspace packages at bake (`--no-install-workspace`
leaves a hidden PyPI fetch in the first boot). Degradations, documented:
528 encrypted levels seed hollow; MinIO buckets start empty (lazy-populate
needs network on first asset touch).

### D8. Phase-0 app repairs (independently shippable)
- Seed whole-input hash guard (the `TestRunUtils` MD5 pattern over curriculum
  inputs + `schema.rb` + `seed.rake`): no-op `seed:default` 75 s → ~13 s.
  Must cover `course_offerings` (currently no guard at all — 729
  unconditional writes per run).
- Spring/`mutex_m` conflict fix: with Spring off, every single test pays
  ~44 s of boot for a 0.02 s body and edit-reload is 10–13 s; warm Spring
  measured 0.79 s. This is the largest single Rails-DevEx lever found —
  container-independent.
- Root `.dockerignore` (a naive root build context fssyncs everything,
  including nested worktrees — 171 GB observed).
- Bug fixes: Zeitwerk `lib/cdo/aws/` creates `Cdo::Aws` which shadows `::Aws`
  inside `module Cdo` (breaks `db:migrate` in dev at staging tip);
  `analytics_exportable.rake`'s enhance hook performs a live Secrets Manager
  call on every dev `db:migrate` (aborts without credentials).

### D9. devcontainer-spec integration
`@devcontainers/cli up` works against the images with one line of glue:
`"postStartCommand": "/usr/local/bin/entrypoint.sh true"` — the CLI always
replaces ENTRYPOINT with its keep-alive (a devcontainer.json `entrypoint`
key is silently ignored; `overrideCommand: false` exits immediately).
Service startup therefore lives in a script invocable from both ENTRYPOINT
(plain `docker run`) and postStartCommand (spec path).

### D10. Mac/Apple Silicon
Design rule: nothing hot crosses the VM boundary — no bind mounts; repo
volume and image layers live VM-side (the 2019 in-repo docker attempt died
on Mac bind-mount I/O, per its own README). arm64: base images are
multiarch; `mysql:8.0` is multiarch; gems/native builds run natively on GHA
`ubuntu-24.04-arm` (never qemu — repo.mysql.com has no arm64 bookworm debs,
irrelevant under D3). Real M-series measurement is milestone M1, not an
assumption.

## Risks / Trade-offs

- [Fat first-boot copy-up (~1.7 GB/fork, lazy)] → WAL shim + dev flags ship
  in v1; reflink/btrfs volume documented as v2 if disk churn matters in
  practice; disk is reclaimed at `sandbox rm` (verified).
- [Golden refresh breaks on upstream landmines (two live bugs already found)]
  → never-commit-failures + last-good fallback (verified); Phase-0 fixes
  remove the two known ones; refresh reports failures loudly.
- [Gem drift at weeks-stale (bundle install needs network)] → refresh
  reconciles daily so forks inherit; `bundle check` fast-path at sandbox
  create; H-A's 3-week point showed zero drift once — quantify further in
  verification (V-STALE), unproven at months-stale.
- [Branch older than golden (schema from the future)] → dated golden tags
  retained N weeks; H-A scenario 2 (interrupted by usage stop) completes the
  policy evidence.
- [25 GB-class images if scope creeps back to baked trees] → hard rule: repo
  and apps-build artifacts never enter registry images; verification gate on
  image sizes.
- [Two genuinely novel elements (CoW MySQL forking; local golden refresh)
  have no prior art in the wild] → they carry the heaviest verification
  budgets; instrument adoption closely.
- [Shared-host disk pressure from image + layer accumulation] → `sandbox gc`
  (prune dated goldens beyond retention, dangling layers); verification
  V-CHURN asserts zero leaks per cycle.

## Migration Plan

Additive; nothing existing is removed. Rollout: Phase 0 repairs → images +
CI lanes → CLI + refresh (dogfood cohort) → devcontainer integration →
M-series validation → team rollout. Rollback = stop publishing images; native
workflow untouched. The `docker/developers/` compose path remains supported
until the sandbox path demonstrably supersedes it.

## Reference implementations

`references/` in this change directory preserves the proven artifacts from
the experiments: `rails-base.Dockerfile` + `rails-entrypoint.sh` (experiment
C prototype), `db-sidecar.Dockerfile` + `sandbox-compose.yml` (F),
`frontend.Dockerfile` (D), `full-repo.Dockerfile` (E, the fat-image
reference — evidence, not product), `walshim.sh` (H-B's WAL copy+whiteout
shim), `devcontainer.json` (H-C's validated spec glue), `sandbox-locals.yml`,
and `experiment-a-results.md` (datadir-bake timing data). Implementation
starts from these, not from scratch.

## Open Questions

Resolvable at implementation time; each carries a recommendation.

- H-A scenarios 1c/2/3 (vacation catch-up at true 3-week drift; reverse
  skew; interrupted-reseed resumability) were cut short by a usage stop.
  **Recommendation:** run them as the staleness verification lane's first
  execution (task 5.4); V-STALE budgets already carry conservative headroom
  (≤10 min catch-up), so implementation need not block on them.
- Spring fix shape. **Recommendation:** relax the Gemfile's `mutex_m` 0.2.0
  pin to accept the Ruby 3.2 default gem (0.1.2) — Spring's client activates
  the default gem pre-Bundler and nothing in the codebase is known to need
  0.2.0 semantics; if CI proves otherwise, fall back to bundler-first load
  order in the Spring binstubs. Avoid adopting a different preloader — Spring
  is already integrated (`bin/spring`, `spring testunit`).
- Golden refresh scheduling host. **Recommendation:** lazy first-use-of-day
  trigger inside `sandbox new`/`ls` (refresh runs in background; creation
  proceeds immediately from the previous golden with a staleness banner),
  plus optional `sandbox refresh --install-timer` for systemd/launchd users.
  Avoid login hooks — they fail silently on managed laptops.
- Encrypted-levels story (528 levels seed hollow). **Recommendation:**
  v1 ships hollow with a documented list; add opt-in
  `sandbox refresh --with-secrets` for credentialed staff that injects
  `properties_encryption_key` into the *local* refresh only — never into
  registry images, preserving the zero-credential default posture.
- `--rails` apps-bundle delivery (base-image layer vs separate artifact).
  **Recommendation:** neither — build it during the local golden refresh
  (warm-cache `yarn build` measured at 1m48s, and `apps/src` changes ~daily,
  so any registry-shipped bundle violates the download economics that killed
  the fat image). Registry ships caches; the local refresh materializes
  artifacts. Sandboxes mount the golden's bundle read-only.
- MySQL CLONE plugin at bake (task 2.4). **Recommendation:** keep the proven
  clean-shutdown tar for v1 — it is already gated and verified; adopt CLONE
  only if the bake pipeline's shutdown gate proves flaky in practice.
