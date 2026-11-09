# Pegasus Removal: Directory Removal

Change 11 of the pegasus removal series (`specs/pegasus-removal/plan.md`,
tier 4). Deletes the `pegasus/` directory and every remaining
reference to its paths.

## Why

After `pegasus-db-retire`, nothing invokes `pegasus/Rakefile`,
nothing migrates `pegasus/migrations/` (142 files defining a schema
that no longer exists anywhere), nothing reads
`pegasus/cache/i18n/` (~10 MB of LFS JSON whose CI writer was
removed in May 2026, #72803/#72846), and nothing writes
`pegasus/cache/` (last writer removed by
`pegasus-shared-resources-port`). The directory is pure inertia,
plus a handful of tools that still know its path: the k8s image
pipeline builds and links a `code-dot-org-pegasus` layer, DTS flags
PRs touching `pegasus/migrations/`, lint configs exclude deleted
files, and two infra tools keep cache files under `pegasus/cache/`.

## What Changes

- `git rm -r pegasus/` (Rakefile, rake/, migrations/, test/, cache/
  incl. the LFS i18n JSON, log/, .gitignore files).
- `.gitattributes`: remove the `pegasus/cache/i18n/**` LFS rule, the
  `en-US.json` merge-driver exception, and the dead `pegasus/sites*`
  patterns.
- k8s: delete `k8s/docker/code-dot-org-pegasus.dockerfile` +
  `.dockerignore`, the pegasus layer references in
  `code-dot-org.dockerfile`, the pegasus rules in
  `code-dot-org.dockerfile.dockerignore` (and the
  `update-dockerignore-from-gitignore.rb` input that generated them),
  the `code-dot-org-pegasus` artifact + `mimic-pegasus` wiring in
  `k8s/kustomize/skaffold.yaml`, and the `k8s/docker/README.md`
  mention.
- Cache-path relocations (the two tools that outlive the directory):
  `lib/cdo/aws/cloudfront.rb` `CLOUDFRONT_ALIAS_CACHE` and
  `lib/cdo/analytics/milestone_parser.rb` cache paths move from
  `pegasus_dir('cache', ...)` to `deploy_dir('tmp', ...)`
  (+ the milestone test's path).
- Lint/CI/tooling: `lib/rake/lint.rake` drops the `pegasus` haml-lint
  arg; `.haml-lint.yml`/`.haml-lint_todo.yml` drop pegasus excludes;
  `lib/cdo/github.rb` drops `PEGASUS_DB_DIR` and its
  `pr_changed_files` migration filter; `bin/content-push` drops the
  `pegasus` path token; delete
  `tools/customLinters/rubocop_pegasus_requires.rb` (+ registration).
- `deployment.rb`: delete `pegasus_dir` (the last reference dies in
  this change).
- Delete `docs/pegasus-dashboard-integration.md` (describes deleted
  architecture); remaining prose-doc updates belong to
  `pegasus-gem-final-sweep`.

Depends on: `pegasus-cron-detach`, `pegasus-shared-resources-port`,
`pegasus-db-retire`.

## Capabilities

### New Capabilities

- `pegasus-directory-removed`: no `pegasus/` directory; no
  `pegasus_dir` helper; no tooling references pegasus paths.

### Modified Capabilities

_None._

## Impact

- ~230 files deleted (mostly migration stubs and LFS JSON);
  repo sheds the LFS objects from new checkouts.
- k8s image graph loses one layer; skaffold config shrinks.
- CloudFront alias cache and milestone cache re-warm at their new
  paths on next use (both are derived caches).
- DTS stops special-casing pegasus migration PRs (there can be none).
