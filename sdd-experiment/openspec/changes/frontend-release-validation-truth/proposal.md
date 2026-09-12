# Proposal: frontend-release-validation-truth

Evidence base: release/CI audit in
`openspec/frontend-platform-exploration-report.md`, verified 2026-07-04.

## Why

The workspace's validation vocabulary overpromises. `yarn release:dryrun`
— the command AGENTS.md tells every contributor to run "before reporting
success" — is a turbo task with no backing script in any package: it is
build+lint+test and exercises zero packaging, versioning, or publish
steps. Meanwhile the two actually-publishable packages
(component-library, component-library-styles) publish manually via
`release-it` with no CI involvement, GHA installs run non-immutable
(`.github/actions/frontend/setup` uses plain `yarn install` while the
Drone/DTT script enforces `--immutable`), and the Playwright container
tag ↔ catalog pin lockstep is enforced only by comments in four files.

## What Changes

- `release:dryrun` is made truthful — keep the name and make it earn it
  by adding a real package-validation step per publishable package:
  `publint` (added as a workspace devDep) against the built package,
  plus a node resolution smoke that imports/requires every `exports`
  subpath from `dist/` in both ESM and CJS forms, plus `yarn pack
  --dry-run` file-list verification. Fallback, taken only if the
  measured overhead exceeds 60 seconds on a full `yarn release:dryrun`
  run: rename the aggregate to `validate` and reserve `release:*` for
  tasks that touch packaging. Either outcome ends the misnomer; the
  threshold makes the choice mechanical.
- Export-map validation catches today's known gap class:
  `component-library-styles` has no `exports` field at all (consumers
  deep-import file paths; renames break ~85 consuming files silently).
  Adding its exports map is in scope as the first fix the check finds.
- `.github/actions/frontend/setup/action.yml` installs with
  `--immutable`, matching the Drone/DTT lane, so lockfile drift fails
  fast on GHA too (per the accounts-CI incident precedent).
- A lockstep assertion script checks the `PLAYWRIGHT_IMAGE_TAG` value
  in `.github/workflows/frontend-ci.yml`, `.github/workflows/dtt.yml`,
  and `.github/workflows/component-library-deploy.yml` against the
  catalog's exact playwright pin in `frontend/.yarnrc.yml`; wired into
  the frontend setup action so drift fails loudly instead of breaking
  e2e lanes at a distance.
- Publish automation decision recorded: either a `workflow_dispatch`
  release workflow invoking the existing `release-it` configs with
  GitHub Packages auth, or an explicit statement in the READMEs that
  publishing is manual-by-policy. `BLOCKED-EVIDENCE: release-owner
  decision; the audit found configs but no policy statement either way.`

## Capabilities

### New Capabilities

- `frontend-release-validation`: validation commands do what their names
  say; publishable packages are machine-validated for packaging
  correctness; CI installs are reproducible; cross-file version pins are
  asserted, not commented.

### Modified Capabilities

(none)

## Impact

`frontend/turbo.json`, publishable packages' `package.json` (+ exports
map for component-library-styles), `.github/actions/frontend/setup`,
`.github/workflows/frontend-ci.yml`, possibly a new release workflow.
Consumer risk concentrates in the component-library-styles exports map
(deep-import paths must keep resolving — the map lists existing paths,
changing none). Independent of other changes; any order.
