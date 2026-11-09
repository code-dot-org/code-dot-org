# Tasks: golden-fork devcontainers

## 1. Phase 0 — in-repo repairs (each independently shippable)

- [ ] 1.1 Fix Zeitwerk `Cdo::Aws` shadowing of `::Aws` (qualify references in `lib/cdo/secrets.rb` et al.; regression test that dev `db:migrate` boots)
- [ ] 1.2 Gate `analytics_exportable.rake` enhance hook so dev `db:migrate` makes no live Secrets Manager call
- [ ] 1.3 Fix Spring/`mutex_m` activation conflict (or adopt an alternative preloader); verify single-test loop returns to ~1 s warm
- [ ] 1.4 Add root `.dockerignore` (derive from `.gitignore`, include `.claude/worktrees/`)
- [ ] 1.5 Implement seed whole-input hash guard per `seed-hash-guard` spec (incl. `course_offerings` per-file digest, DB-stored hash, bypass flag) with unit tests
- [ ] 1.6 Close seed-completeness gap: reference tables (`concepts` canary) present in the baked DB's schemas used by model tests

## 2. Registry images (`sandbox-images`)

- [ ] 2.1 Author `cdo-dev-base` Dockerfile from the experiment-C/D reference implementations (slim pinned base, lockfile-keyed layers, offline-complete venv, warm yarn cache, empirical apt set with per-package provenance comments)
- [ ] 2.2 Author `cdo-dev-db` Dockerfile (`mysql:8.0` base, seed-with-own-mysqld bake script, clean-shutdown gate, binlog purge, LFS verification, zero-credential enforcement)
- [ ] 2.3 GHA bake lanes: amd64 + native arm64 runners, content-hash triggers + weekly schedule, size gates, dated tags with 28-day retention, publish to GHCR
- [ ] 2.4 Evaluate MySQL CLONE plugin for snapshot production at bake (vs clean-shutdown tar); adopt if it simplifies the pipeline
- [ ] 2.5 Decide and implement the `--rails` apps-bundle delivery (base-image layer vs separate artifact) per design open question

## 3. Sandbox CLI + golden refresh (`sandbox-cli`, `golden-refresh`)

- [ ] 3.1 `bin/sandbox` skeleton: `new/rm/ls`, compose trio, persona profiles with curated defaults (memory limits, sysctls, `/etc/hosts`, tmpfs shadow-mounts over `dashboard/tmp` + `dashboard/log`)
- [ ] 3.2 Clone-volume + worktree management (git-lfs preflight, single-volume pointer correctness, local-store LFS smudge, shallow-clone first-run with background unshallow)
- [ ] 3.3 DB fork start protocol: WAL copy+whiteout shim, dev-durability flags
- [ ] 3.4 Golden refresh orchestrator: triggers (lazy daily / input-change / on-demand), 7-point commit checklist, never-commit-failures fallback, single-layer re-bake, loud failure reporting
- [ ] 3.5 `sandbox update` (in-sandbox catch-up), `snapshot`, `gc`
- [ ] 3.6 Local timing telemetry (opt-out) for budget regression detection

## 4. devcontainer integration (`devcontainer-integration`)

- [ ] 4.1 Per-persona devcontainer.json (compose form, `postStartCommand` service startup, uid-1000 remoteUser)
- [ ] 4.2 Verify VS Code and `@devcontainers/cli` attach paths; document agent-harness attachment (Claude Code sandbox usage)
- [ ] 4.3 macOS volume topology (no repo bind mounts); document OrbStack/Docker Desktop setup

## 5. DevEx verification suite (`devex-verification`)

- [ ] 5.1 Harness: `sandbox verify [--quick|--full]`, budget table as data, report format
- [ ] 5.2 Creation/churn/isolation/disposability checks (V-CREATE, V-CHURN, V-ISOLATION, violence suite)
- [ ] 5.3 Persona loop checks: rails (edit-reload, single-test, console, level-page), frontend (install/HMR/vitest/storybook/typecheck, offline), apps (dev-server ready/rebuild/memory headroom, Vite-Rails integrated mode)
- [ ] 5.4 Staleness lane: weekly 21-day-replay vacation scenario + reverse skew + interrupted-catch-up resumability (finish H-A scenarios 1c/2/3 as its first run and fold measured numbers into budgets)
- [ ] 5.5 Zero-credential/offline probes; download-economics and image-size assertions
- [ ] 5.6 Wire suite into CI: block image publish on failure; nightly run against `latest`
- [ ] 5.7 First-run budget check (clean-machine simulation)

## 6. Validation milestones and rollout

- [ ] 6.1 M1: full suite green on physical Apple Silicon (≤ 2× Linux budgets); record platform baseline
- [ ] 6.2 Dogfood cohort (3–5 devs across personas) for two weeks; weekly survey; triage regressions against budgets
- [ ] 6.3 Docs: SETUP-sandbox path, persona guide, troubleshooting (known degradations: encrypted levels, empty MinIO, test-env prep)
- [ ] 6.4 Team rollout + deprecation decision review for `docker/setup-compose.yml`-era artifacts (leave `docker/developers/` untouched)
