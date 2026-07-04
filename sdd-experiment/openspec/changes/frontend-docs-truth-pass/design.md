# Design: frontend-docs-truth-pass

## Context

Fifteen verified doc-vs-code contradictions across `frontend/README.md`,
`frontend/AGENTS.md`, `docs/conventions/packages.md`, core's three READMEs,
component-library's three docs, users' README, and studio's architecture
doc. Full evidence table in
`openspec/frontend-platform-exploration-report.md`.

## Goals / Non-Goals

**Goals:**

- Every statement a module author acts on (paths, commands, API names,
  route URLs) is verifiable against the tree at merge time.
- Aspirational content survives, but labeled as such.

**Non-Goals:**

- No code, template, or config changes (generator fixes are
  `frontend-generator-catalog-alignment`).
- No new conventions — only truth-alignment of existing ones.
- No structural guard against future drift (that is the generator
  change's conformance check).

## Decisions

- **Write `docs/conventions/tech.md` rather than delete the AGENTS row.**
  The Rails-Vite integration contract (meta tag, basepath lockstep,
  `vite_typescript_tag`) is currently documented only in scattered inline
  comments; the AGENTS table already reserves the slot. Flagged
  `BLOCKED-EVIDENCE` for owner preference; deleting the row is the cheap
  fallback.
- **Relabel, do not delete, aspirational README content** (users): the
  content encodes real design intent the app-package-conventions change
  builds on; deleting loses it, shipping it unlabeled misleads.
- **Scope the `"type": "module"` rule instead of enforcing it**: two
  packages already violate it without breaking the portal consumers,
  so the rule as written is wrong, not the packages.

## Risks / Trade-offs

- Docs can re-drift; accepted — the structural check lives in the
  generator change.
- Touching the design-system skill file affects agent guidance repo-wide;
  the fix is strictly a path correction.
