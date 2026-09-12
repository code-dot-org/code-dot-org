# apps/src/ — client-side JS/TS conventions

Most client JS/TS/JSX/TSX lives here (the legacy webpack bundle; new modular
code goes in `frontend/`). Distilled from recurring review feedback; applies to
all of `apps/src/`. Subdirectories may add stricter rules.

## Comments

- Default to none. Add one only for a non-obvious *why*; never restate the code.
- Prefer a good name over a comment, a clause over a sentence.
- Lead with the one load-bearing sentence and stop: mechanism narratives,
  worked examples, and design rationale belong in the PR description. Review
  feedback here is consistently "trim", never "expand".
- Don't describe callers or call sites — they drift, and grep answers
  who-calls-this.
- Describe the code as it is — no "previously…", "no longer…", or rejected
  alternatives.
- Say it once, and keep it true to the code it sits on: update or delete it in
  the same change as the thing it describes.
- "allowlist"/"blocklist", not "whitelist"/"blacklist".
- `/** */` on exported symbols and interface/type members — IDE tooltips
  surface those; `//` elsewhere.
- Worked good/bad examples: `apps/src/sketchlab/reactFlow/AGENTS.md`.

## One source of truth

Compute a value or condition once and reuse it; factor duplicated markup/logic
into one helper. Don't leave two copies that can drift apart.

When deleting a module, account for every responsibility it had, not just the
one being replaced — side duties (validation, sanitization, cleanup) die
silently otherwise.

## Reuse types, don't redeclare

Import the canonical type instead of a parallel shape that will drift — e.g.
`MultiFileSource`/`AppName` (`lab2/types.ts`), `PanelLayout` (`panels/types.ts`).

## Imports

Prefer `@cdo/apps/...` (aliases `apps/src/`) over relative paths that reach
past the parent directory. Any `../../` or deeper → use the alias; `./` and a
single `../` are fine.

Static assets (images, audio): `import`, not `require` — same bundle output,
and imports type-check.

## Named constants over magic numbers

Name magic numbers and structural literals (panel counts, folder layouts,
limits): the name documents intent and centralizes the value.

## Keep modules and components focused

Split a growing per-lab/per-feature module (e.g. one file per lab under
`levelbuilder/lesson-generator/ai/`) and big React surfaces (extract
subcomponents, hooks, helpers) rather than letting one file sprawl.

## Use shared helpers; don't hand-roll

Use an existing client/helper instead of re-implementing inline — e.g. HTTP
requests via `@cdo/apps/util/HttpClient` (not a raw `fetch`), or aichat
completions via `aichat/api/client`.

## Design for extension

Hoist supported types/variants into one union, map, or registry so a new case is
a one-line edit; wrap a leaky dependency behind a thin interface.

## Continuous improvement

Hit a wrong assumption or repeated correction here? Propose an update to this
file or the relevant subdirectory `AGENTS.md`.
