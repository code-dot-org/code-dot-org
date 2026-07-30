# seeded-db-snapshot — design

## Context

A fresh environment seeds dashboard MySQL by running migrations and importing
curriculum content (`dashboard/config/scripts`, `scripts_json`, `levels`, …).
On an M2 this is 25+ minutes of CPU-bound Ruby, repeated identically by every
developer and CI job because the inputs rarely change between runs.
`k8s/TODO.md` notes we may have "existing (broken?) code" that already
computes a seed hash; that code must be found and judged before new hashing
logic is written.

The helm chart runs `mysql:8.0` (`k8s/helm/templates/services/mysql.yaml`);
GHCR auth and image publishing already exist in `.github/workflows/`.

## Goals / Non-Goals

**Goals:**
- Fresh environment gets a seeded DB in download time, not seed time.
- Snapshot is keyed by content: same inputs → same key → cache hit.
- One producer (CI), many consumers (skaffold `setup-db`, devcontainer, CI).
- Miss degrades to today's full seed; nothing new can hard-fail setup.

**Non-Goals:**
- Changing what the seed contains or how `dashboard:setup_db` works.
- Production or adhoc data. This is dev/CI seed data only.
- Incremental re-seeding (apply only the delta). Full snapshot or full seed.
- pegasus DB (separate seed path; can follow the same pattern later).

## Decisions

1. **Datadir tarball over mysqldump.** A MySQL datadir tarball restores in
   roughly untar time; a dump replays every INSERT and rebuilds indexes,
   giving back a large slice of the time we set out to save. Cost: the
   tarball is pinned to the mysql:8.0 minor version the helm chart runs, so
   the pin is made explicit — snapshot metadata records the server version
   and consumers refuse a mismatched restore (fall back to seed). Compress
   with zstd. Alternative: mysqldump (portable across versions, simpler) —
   rejected as too slow to restore at this data size.
2. **GHCR OCI artifact over S3.** GHCR auth already exists in the repo's
   workflows, artifacts are content-addressable, and org visibility comes
   for free. Alternative: S3 bucket — another credential path and lifecycle
   config to own, for no gain.
3. **Hash = git tree hashes of the input paths.** Key the snapshot on
   `git rev-parse` tree hashes of the seed inputs (curriculum config dirs,
   `dashboard/db/migrate` + schema, seed rake sources, seed fixtures),
   combined into one digest. Tree hashes are stable across checkouts and
   clones; mtimes and stat-based schemes are not. The exact input list is an
   implementation task and must err inclusive: a missed input means a stale
   snapshot that hash-matches.
4. **Audit the existing hash code first.** `k8s/TODO.md` says prior
   (possibly broken) seed-hashing code exists. Find it, decide repurpose vs
   replace, and record the verdict in the PR before writing new logic.

## Risks / Trade-offs

- [Snapshot drifts from branch schema] → always run `db:migrate` after
  restore; migrations are a hash input, so migration changes re-key the
  snapshot anyway.
- [Artifact size — a levels-seeded DB may be GBs] → measure first,
  zstd-compress, retention policy pruning old hash keys.
- [Seed data contains something non-public] → verify seed inputs are public
  curriculum content only before publishing; private package is the default
  until verified.
- [Datadir portability across arm64/amd64] → InnoDB datadir files are
  arch-independent, but verify: restore an amd64-produced snapshot on arm64
  in CI before shipping.

## Migration Plan

Ship the producer job first; it publishes snapshots without any consumer
depending on them. Then switch the skaffold `setup-db` profile to
restore-or-seed. Rollback = consumers ignore the snapshot and seed as today;
no state to unwind.

## Open Questions

- Exact seed input set: does anything outside `dashboard/config/*` and
  `dashboard/db/` feed the seed (videos, shared fixtures, `lib/` code)?
- Package visibility: can the snapshot be org-public, or does anything in
  the seed require it stay private?
- Should the producer job also gate CI (fail if seed breaks), or stay
  publish-only?
