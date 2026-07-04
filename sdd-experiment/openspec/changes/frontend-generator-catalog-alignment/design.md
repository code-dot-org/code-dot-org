# Design: frontend-generator-catalog-alignment

## Context

The generator (`turbo/generators/config.ts`, two generators: `package`,
`lab`) is documented as the enforcement mechanism for
`docs/conventions/packages.md`, with a mutual-update rule in
`frontend/AGENTS.md:82-93`. Verified drift: templates hardcode React 19
against a catalog-pinned React 18 workspace (G1–G3), peer ranges admit
React 17 that no lab supports (G6), the studio-dep insertion regex is
order-dependent (G8), and the real oceans registration diverges from what
the generator emits (G4) — proof that post-gen hand-edits already happen
silently.

## Goals / Non-Goals

**Goals:**

- Generated output is indistinguishable in conventions from the best
  real package (music).
- Generator failures are loud at generation time, not silent 404s at
  route time.
- Convention/template coupling is checked by CI, not by rule text.

**Non-Goals:**

- No React 19 migration (the catalog pin stays until the `apps/` portal
  boundary allows otherwise).
- No new generator kinds (the app-shaped generator belongs to
  `frontend-app-package-conventions`).
- No retrofitting of existing packages (oceans' hand-wired entrypoint is
  legitimate; the conformance check applies to fresh output only).

## Decisions

- **`catalog:` over pinned literals in templates.** The catalog is the
  declared single source of truth (`.yarnrc.yml`); templates referencing
  it can never drift on shared deps. Rejected alternative: a template
  variable interpolated at gen time — still a second copy.
- **Marker-comment anchors over smarter regex.** A regex that understands
  package.json ordering is still order-coupled; an explicit
  `/* turbo-gen:labs */`-style anchor in the four registration sites is
  trivially greppable and self-documenting. Post-gen assertion verifies
  all four anchors were hit.
- **Conformance check generates into a temp dir inside the workspace,
  builds, then discards.** Full-fidelity (real yarn/turbo resolution)
  beats snapshot-comparing template text, which would not have caught
  G1 (the catalog conflict is only visible at install/build).
  Cost: one extra CI job on generator/template/conventions-doc paths
  only (path-filtered), not on every frontend PR.

## Risks / Trade-offs

- The conformance job adds CI time when generator paths change; bounded
  by path filtering and turbo cache.
- Marker comments in `apps/studio/package.json` are unconventional
  (comments in JSON are not portable) — the anchor there is instead a
  well-known dep name boundary or a sidecar registration module;
  decided at implementation, assertion requirement is what the spec
  pins.
- Temp-workspace generation mutates `yarn.lock` transiently; the job
  must run with a throwaway checkout, never push artifacts.
