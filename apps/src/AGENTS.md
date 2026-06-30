# apps/src/ — client-side JS/TS conventions

Most client JS/TS/JSX/TSX lives here (the legacy webpack bundle; new modular
code goes in `frontend/`). Distilled from recurring review feedback; applies to
all of `apps/src/`. Subdirectories may add stricter rules.

## Comments

- Default to none. Add one only for a non-obvious *why*; never restate the code.
- Prefer a good name over a comment, a clause over a sentence.
- Describe the code as it is — no "previously…", "no longer…", or rejected
  alternatives.
- Say it once, and keep it true to the code it sits on: update or delete it in
  the same change as the thing it describes.
- Worked good/bad examples: `apps/src/sketchlab/reactFlow/AGENTS.md`.

## One source of truth

Compute a value or condition once and reuse it; factor duplicated markup/logic
into one helper. Don't leave two copies that can drift apart.

## Reuse types, don't redeclare

Import the canonical type instead of a parallel shape that will drift — e.g.
`MultiFileSource`/`AppName` (`lab2/types.ts`), `PanelLayout` (`panels/types.ts`).

## Named constants over magic numbers

Name magic numbers and structural literals (panel counts, folder layouts,
limits): the name documents intent and centralizes the value.

## Keep modules and components focused

Split a growing per-lab/per-feature module (e.g. one file per lab under
`levelbuilder/lesson-generator/ai/`) and big React surfaces (extract
subcomponents, hooks, helpers) rather than letting one file sprawl.

## Use shared helpers; don't hand-roll

Use an existing client/helper instead of re-implementing inline — e.g. aichat
completions via `aichat/api/client` (cf. `frontend/`'s `DashboardApiClient` for
Dashboard calls, never a raw `fetch`).

## Design for extension

Hoist supported types/variants into one union, map, or registry so a new case is
a one-line edit; wrap a leaky dependency behind a thin interface.

## Continuous improvement

Hit a wrong assumption or repeated correction here? Propose an update to this
file or the relevant subdirectory `AGENTS.md`.
