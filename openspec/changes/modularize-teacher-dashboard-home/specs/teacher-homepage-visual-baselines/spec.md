## ADDED Requirements

### Requirement: Strict region-scoped screenshot checks over the state matrix
The package SHALL provide Playwright visual tests against the standalone MSW
host using strict screenshot assertions (zero diff budget,
`animations: 'disabled'`, `caret: 'hide'`, CSS scale), scoped to regions by
locator per the matrix: page frame, header, alert stack, section grid, single
section card (per login type, archived, coteacher, overflow), options dropdown,
join-link dialog, delete/archive-all modals, empty homepage, promotions
variants, drawer states, onboarding checklist states, demo popup — at 1280×800
plus a 360px floor check for the frame. Masks SHALL be forbidden unless a
comment names the nondeterminism source.

#### Scenario: A region check fails only for its region
- **WHEN** an unrelated part of the page changes
- **THEN** locator-scoped checks for other regions still pass

### Requirement: Determinism contract precedes every baseline
Every baseline SHALL be captured under the determinism contract: clock frozen
via persona-fixed dates; packaged fonts preloaded with `document.fonts.ready`
plus a visual-stability settle; MUI transitions disabled; randomness (NPS
sampling, presets, avatars) pinned by persona seed; locale en-US with the
translation widget inactive.

#### Scenario: Font-race immunity
- **WHEN** the suite runs on a cold browser profile
- **THEN** screenshots are taken only after fonts are loaded and layout is
  stable, and results match warm runs

### Requirement: Stress-gated acceptance and zero-delta mechanical edits
Every new or changed baseline SHALL pass 12 consecutive runs before acceptance;
CI SHALL run the suite on every staircase PR with diffs investigated rather
than retried; baselines captured after a verbatim move commit SHALL pass with
zero pixel delta through that PR's seam-edit commits, and a baseline change
outside a PR's declared scope SHALL fail review.

#### Scenario: Accepting a new baseline
- **WHEN** a region/state check is added
- **THEN** it is committed only after 12 consecutive green runs on the
  standalone host

#### Scenario: A "mechanical" edit shifts pixels
- **WHEN** a seam-edit commit produces any visual diff
- **THEN** the edit is treated as behavioral, root-caused, and either fixed or
  explicitly re-scoped with a reviewed baseline update
