# Design: pegasus-directory-removal

## Context

Reference inventory (`specs/pegasus-removal/inventory-directory.md`,
verified 2026-07-07; re-verify at implementation — earlier series
changes will have removed several):

- Directory: `pegasus/{Rakefile, rake/{db,test}.rake,
  migrations/*.rb ×142, test/test_helper.rb, cache/{.gitignore,
  i18n/*.json ×~60 LFS}, log/.gitignore, .gitignore}`.
- Path references outside the dir (post-tier-3 expected survivors):
  `deployment.rb:83-84` (`pegasus_dir` definition),
  `lib/cdo/aws/cloudfront.rb:78` (alias cache file),
  `lib/cdo/analytics/milestone_parser.rb:29-30,99` (+
  `shared/test/test_milestone_parser.rb:28`),
  `lib/rake/lint.rake:16` (haml-lint arg),
  `lib/cdo/github.rb:12,40-49` (PEGASUS_DB_DIR migration-PR filter),
  `bin/content-push:7` (CONTENT_PATHS token),
  `tools/customLinters/rubocop_pegasus_requires.rb`,
  `.gitattributes:23-25,54-65,85-87`,
  `.haml-lint.yml:200-201`, `.haml-lint_todo.yml:65-81`,
  k8s files (`code-dot-org-pegasus.dockerfile`,
  `code-dot-org.dockerfile:15,205-207`, both dockerignores,
  `update-dockerignore-from-gitignore.rb`,
  `skaffold.yaml:23,49,71,79,82,174,180,204`,
  `k8s/docker/README.md:23`,
  `k8s/docker/benchmark-skaffold-rebuilds/*`).

`bin/count-lines-of-code-from-milestone-logs_v2` is the milestone
parser's only consumer — an ops analysis tool; kept, repointed.

## Goals / Non-Goals

**Goals:** `pegasus/` gone; `pegasus_dir` gone; every tool that
named a pegasus path either deleted with its purpose or repointed.

**Non-Goals:** prose documentation sweep (README/TESTING/AGENTS
etc. — `pegasus-gem-final-sweep`); the `sinatra` gem; anything
DB-related (already retired).

## Decisions

**1. Cache relocations use `deploy_dir('tmp', ...)`.**
`CLOUDFRONT_ALIAS_CACHE` (written by infra tooling when updating
CloudFront alias lists; read by `lib/cdo/rack/allowlist.rb`,
`lib/cdo/cloud_formation/cdo_app.rb`, `lib/rake/infra.rake`) and the
milestone parser's S3-download caches are derived, re-warmable
files. `deploy_dir('tmp', ...)` exists on every environment and is
gitignored at root. Rejected: `dashboard/tmp` (these tools run from
repo root outside Rails), scratch dirs (must survive within a
deploy).

**2. Migrations delete with no replacement.** The schema they
describe no longer exists anywhere (`pegasus-db-retire` dropped it);
dev/test/CI never create it. `Sequel::Migrator` leaves the codebase
with `pegasus/rake/db.rake`.

**3. k8s edits are mechanical but verified by build.** The
`code-dot-org-pegasus` image exists solely to COPY the directory
into the composite image; removing a layer requires keeping the
remaining layer links consistent (`code-dot-org.dockerfile:15,
205-207`). `update-dockerignore-from-gitignore.rb` regenerates
dockerignores — run it after deleting the source `.gitignore`s and
commit its output rather than hand-editing the generated rules.

**4. LFS.** Deleting the files + the `.gitattributes` rules is
enough; history keeps the objects (repo-size cleanup of historical
LFS is out of scope).

**5. `git rm` ordering with lint configs.** Delete the directory and
the lint excludes in the same commit — `.haml-lint_todo.yml` entries
for nonexistent files are harmless, but `lib/rake/lint.rake` passing
a nonexistent `pegasus` arg to haml-lint fails the lint task.

## Risks / Trade-offs

- **An out-of-repo consumer of `pegasus/cache/i18n`** (external sync
  reader). Evidence says the writer stopped in May 2026 and no
  in-repo reader exists; if an external system still pulls these
  files from the repo, it has been reading stale data for months —
  flagged in the PR for the i18n team to ack.
- **Skaffold/k8s pipeline breakage** surfaces only when someone
  builds the images; task includes a local skaffold build if the
  toolchain is available, else explicit reviewer callout to the
  infra owner of `k8s/`.
