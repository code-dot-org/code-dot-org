# seeded-db-snapshot

## Why

Seeding the dashboard DB (`rake dashboard:setup_db`, the skaffold `setup-db`
profile) takes 25+ minutes on an M2 and runs on every fresh environment.
`k8s/TODO.md` already asks for the fix: snapshot the seeded DB in a GH action,
key it by a hash of everything that could change the seed, and re-use it in
dev. This is the single highest-leverage onboarding-time item: it converts a
25-minute compute step into a download.

## What Changes

- A GitHub Actions job seeds MySQL from scratch whenever the content hash of
  the seed inputs changes (curriculum config dirs, migrations/schema, the seed
  rake sources, seed fixtures — exact set pinned in design).
- The seeded database ships as a content-hash-keyed OCI artifact on GHCR
  (GHCR auth and image publishing already exist in our workflows).
- Consumers compute the same hash and restore instead of reseeding: the
  skaffold `setup-db` path, the future devcontainer `postCreateCommand`
  (`dashboard-devcontainer`), and CI jobs needing a seeded DB. Cache miss
  falls back to full seed.
- Restore always runs `db:migrate` afterward to close drift between the
  snapshot and the current branch.

## Capabilities

### New Capabilities

- `seeded-db-snapshot`: the contract for producing, keying, publishing, and
  restoring a seeded dashboard MySQL snapshot.

### Modified Capabilities

None (no existing specs).

## Impact

- New `.github/workflows/` job (seed + publish on hash change)
- `skaffold.yaml` `setup-db` profile gains the restore-or-seed path
- Possibly `k8s/helm` mysql init/job templates
  (`k8s/helm/templates/services/mysql.yaml`)
- Resolves the `k8s/TODO.md` seeded-DB-snapshot item
- Independent of the docker image proposals; pairs with
  `dashboard-devcontainer`.
