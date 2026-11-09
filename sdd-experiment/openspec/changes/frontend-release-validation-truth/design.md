# Design: frontend-release-validation-truth

## Context

Verified state: `release:dryrun` = turbo `dependsOn: [build, lint, test]`
with no task body anywhere; publish = manual `release-it --preRelease=
alpha` to GitHub Packages on two packages, invoked by no workflow;
GHA setup action installs non-immutable; Playwright image tag pinned by
comment in four files against a catalog exact pin.

## Goals / Non-Goals

**Goals:**

- A green `release:dryrun` means the publishable artifacts are actually
  publishable.
- Reproducible installs on every CI lane.
- Version-pin lockstep enforced by a script, not comments.

**Non-Goals:**

- No versioning-strategy redesign (alpha pre-release flow stays).
- No registry migration (GitHub Packages stays).
- No workspace-wide `exports` retrofit — only packages the validation
  flags, starting with component-library-styles.

## Decisions

- **Make the name earn itself (publint + resolution smoke + pack
  dry-run) over renaming.** Renaming touches muscle memory, AGENTS.md,
  and CI configs for cosmetic honesty; adding the missing validation
  makes the existing contract true and catches a real defect class
  (the styles package's missing exports map). The rename is the
  recorded fallback, triggered mechanically: >60s added wall time on a
  full `yarn release:dryrun` (checkpoint task 1.2 measures and
  records).
- **publint-class checking as a turbo task on publishable packages
  only** (`private: false` is the selector); private packages keep the
  cheap aggregate.
- **`--immutable` on GHA**: matches the hardened Drone script and the
  prior accounts-CI incident learning (drifted lockfile should fast-fail
  the build, not mutate it).
- **Lockstep check as a setup-action step**, not a standalone workflow:
  it must run exactly where the image tag is consumed.

## Risks / Trade-offs

- `npm pack --dry-run` under yarn 4 needs care (use `yarn pack --dry-run`
  or publint against the built `dist/`); implementation verifies both
  ESM and CJS entry resolution rather than trusting the manifest.
- Adding an exports map to component-library-styles is the one consumer-
  visible edit; mitigated by enumerating current deep-import paths from
  the audit (~85 consuming files) and mapping all of them.
- `--immutable` will fail PRs that used to "work" via silent lockfile
  mutation; that is the intended behavior change and needs a one-line
  contributor note in `frontend/README.md`.
