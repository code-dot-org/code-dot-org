---
title: Update after a deploy
description: Find documentation pages affected by a deploy, reinvestigate their claims, refresh screenshots, and open a PR.
type: task
---

This workflow finds documentation pages affected by a deploy, routes each to its domain owner, and produces a focused update PR.

## Find the last documented revision

Each evidence file records the revision it was last verified against in `verification.revision`. The oldest such revision across all evidence files is the baseline. To find it:

```sh
jq -r '.verification.revision // empty' .docs-evidence/**/*.json | sort -u | head -1
```

Use that value as `<old-rev>`. The new deploy commit is `<new-rev>`.

## Find affected pages

The `docs:affected` script compares the `sources` in each evidence file against the files changed between two revisions:

```sh
cd frontend/apps/docs
yarn docs:affected <old-rev> <new-rev>
```

Example output (against the last 20 commits on staging):

```
developers/ai/ai-subsystem.md
developers/curriculum/curriculum-authoring.md
developers/platform/background-jobs.md
developers/platform/frontend-build.md
developers/platform/observability.md
developers/platform/system-overview.md
developers/projects/project-storage.md
developers/projects/sandboxed-preview-domain.md
students/activities/get-your-certificate.md
students/labs/music-lab/
teachers/professional-learning/attend-a-workshop.md
teachers/professional-learning/find-a-workshop.md
```

Each line is a page path relative to `docs/`. Pages whose evidence `sources` intersect the changed files appear in the list.

## Route pages to domain owners

The `assigned_domain` field in `.docs-work/inventory.yaml` maps inventory areas to domain owners. The domain list:

| Domain | Scope |
|---|---|
| accounts-and-access | Sign-in, account settings, consent, notifications |
| classrooms-and-progress | Sections, rosters, progress, assessment |
| curriculum-and-assignment | Catalog, assignment, home pages, certificates |
| labs-and-learning-experience | Student labs, lab2 framework, Blockly |
| projects-and-sharing | Project storage, sharing, abuse |
| ai-features | AI chat, tutor, rubric evaluation |
| professional-learning | Workshops, enrollment, verification |
| integrations-schools-districts | LTI, Clever, Google Classroom, school data |
| levelbuilder-and-curriculum-pipeline | Levelbuilder, curriculum pipeline, seeding |
| engineering-platform | Rails internals, frontend build, flags, observability |
| delivery-and-operations | Local setup, testing, CI, deploy, staff tools, this runbook |

Each affected page belongs to the domain that owns its directory. The domain owner reinvestigates only the claims that touch the changed sources.

## Reinvestigate

For each affected page:

1. Read the evidence file. Check which `sources` changed.
2. Read the changed source files. Determine whether the page's claims are still accurate.
3. If a claim changed, update the page text. If the change is behavior, re-run the journey spec to confirm.
4. Update the evidence file: bump `verification.revision` and `verification.date`, adjust `verification.result` if the grade changed.

## Refresh screenshots

Re-run only the journeys whose pages changed:

```sh
cd frontend
yarn workspace @code-dot-org/e2e-tests docs:journeys -- --grep '<journey-name>'
```

If a screenshot changed, the journey overwrites the existing image in `docs/<audience>/.../images/`. Commit the updated image.

## Open a PR

Stage only the changed documentation files, evidence files, and images. Verify before pushing:

```sh
cd frontend/apps/docs
yarn build
yarn evidence:check
```

Both must pass. Then open the PR with a title like "docs: refresh pages after deploy <short-sha>".

## Next steps

- [Periodic reconciliation](/developers/documentation/periodic-reconciliation/) -- broader checks beyond deploy-triggered updates.
- [Verification](/developers/documentation/verification/) -- how evidence grades work.
