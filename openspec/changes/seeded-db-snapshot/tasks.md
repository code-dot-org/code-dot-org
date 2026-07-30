# seeded-db-snapshot — tasks

## 1. Groundwork

- [ ] 1.1 Find the "existing (broken?)" seed-hash code `k8s/TODO.md` refers
      to; record repurpose-vs-replace verdict in the PR
- [ ] 1.2 Pin the seed input path list (curriculum config dirs,
      `dashboard/db/migrate` + schema, seed rake sources, seed fixtures);
      err inclusive
- [ ] 1.3 Verify the seed inputs are public curriculum content only; decide
      GHCR package visibility (private default)

## 2. Hash and snapshot format

- [ ] 2.1 Implement key computation from git tree hashes of the input paths;
      one script usable by producer and consumers
- [ ] 2.2 Implement datadir snapshot: quiesce mysqld, tar the datadir,
      zstd-compress; embed MySQL server version in artifact metadata
- [ ] 2.3 Implement restore: version check, untar into a clean datadir,
      then `db:migrate`

## 3. Producer

- [ ] 3.1 Add `.github/workflows/` job: compute key, check GHCR, seed on
      miss, publish OCI artifact tagged with the hash
- [ ] 3.2 Add retention: prune artifacts for stale hashes
- [ ] 3.3 Measure artifact size and seed/publish wall-clock; record in PR

## 4. Consumers

- [ ] 4.1 Wire restore-or-seed into the skaffold `setup-db` profile
      (touching `k8s/helm` mysql init/job templates if needed)
- [ ] 4.2 Document the restore path for the `dashboard-devcontainer`
      `postCreateCommand` and CI consumers

## 5. Verification

- [ ] 5.1 Cross-arch restore: amd64-produced snapshot restores on arm64 and
      dashboard boots against it
- [ ] 5.2 Miss path: with no matching artifact, `setup-db` full-seeds and
      succeeds
- [ ] 5.3 Drift path: branch with an extra migration restores, migrates, and
      passes `db:abort_if_pending_migrations`
- [ ] 5.4 Restore wall-clock on an M2 measured against the 25-minute seed;
      recorded in PR
