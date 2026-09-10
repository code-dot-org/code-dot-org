---
title: Periodic reconciliation
description: Detect vanished sources, failing journeys, orphan images, dangling links, and undocumented routes or flags.
type: task
---

Beyond deploy-triggered updates, run these checks periodically (monthly, or before a documentation review) to catch drift that the deploy workflow misses.

## Evidence parity

Every non-index page needs a matching evidence file, and every evidence file needs a matching page. Run:

```sh
cd frontend/apps/docs && yarn evidence:check
```

This validates all evidence JSON against the schema and reports parity errors (missing evidence, orphan evidence).

## Vanished sources

An evidence file's `sources` array may reference files that no longer exist (renamed, deleted, moved). Check:

```sh
jq -r '.sources[]?' .docs-evidence/**/*.json | sort -u | while read -r f; do
  [ -e "$f" ] || echo "GONE: $f"
done
```

For each vanished source, determine whether the page needs updating (the feature was removed) or the source path just needs correcting (the file was renamed).

## Failing journeys

Run the full journey suite and note failures:

```sh
cd frontend && yarn workspace @code-dot-org/e2e-tests docs:journeys
```

A failing journey means the page's claims may no longer match the product. Investigate the failure: if the product changed, update the page; if the test environment is misconfigured, record BLOCKED.

## Orphan images

Images in `docs/**/images/` that no page references are noise. Check:

```sh
find docs -path '*/images/*.png' | while read -r img; do
  base=$(basename "$img")
  grep -rq "$base" docs/ || echo "ORPHAN: $img"
done
```

Remove confirmed orphans and their evidence `screenshots` entries.

## Dangling links

Internal links should resolve to real pages. After a build:

```sh
cd frontend/apps/docs && yarn build 2>&1 | grep -i 'broken'
```

Docusaurus reports broken internal links during build. Fix the target path or remove the link.

## Undocumented routes and flags

New routes or DCDO keys may appear in the codebase without matching documentation. A rough check:

```sh
# Routes not mentioned in any evidence file:
grep -roh 'get\|post\|put\|patch\|delete' dashboard/config/routes.rb | wc -l
# (Compare against the total number of routes referenced across all evidence files.)
```

This is a rough heuristic. A full reconciliation compares the output of `rails routes` against the union of all evidence `routes` arrays. New routes in areas with existing documentation pages should be investigated.

## Next steps

- [Update after a deploy](/developers/documentation/update-after-deploy/) -- the deploy-triggered workflow.
- [Agent orchestration](/developers/documentation/agent-orchestration/) -- who maintains what.
