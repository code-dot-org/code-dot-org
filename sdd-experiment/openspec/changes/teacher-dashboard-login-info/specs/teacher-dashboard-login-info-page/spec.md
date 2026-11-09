# Spec: teacher-dashboard-login-info-page

## ADDED Requirements

### Requirement: Login info at parity for all six login types
The candidate route SHALL render the moved login-info page at
`/frontend-studio/teacher_dashboard/sections/:sectionId/login_info` with
the exact legacy branch per section `login_type`: word, picture, email
(join/section-code + sign-in instructions), google_classroom and clever
(provider instructions + sync imagery), and lti_v1 (LMS instructions with
the localized issuer-aware `login_type_name`). Copy matches legacy en-US
verbatim; `login_type_name` localization (incl. LTI issuer) comes from the
selected-section payload.

#### Scenario: Each login type renders its variant
- **WHEN** the candidate tab renders for a section of each of the six
  login types (one MSW scenario per type)
- **THEN** the type's instruction variant, imagery, and links match the
  legacy tab for the same section

#### Scenario: LTI issuer name
- **WHEN** the section is lti_v1
- **THEN** the displayed login-type name includes the issuer, as produced
  by the legacy `section.rb` localization

### Requirement: Print flows at parity
The tab SHALL provide the legacy print surfaces: print login cards (shared
moved component with the roster), a link to print certificates, and the
printable parent letter rendered chrome-free at a candidate route from the
same section data the legacy `parent_letter` action uses (including its
secrets-bearing payload — same endpoint and auth gate the legacy UI already
exercises, no wider).

#### Scenario: Parent letter prints
- **WHEN** a teacher opens the candidate parent-letter route for a student
- **THEN** a chrome-free printable letter renders with the same content as
  the legacy `parent_letter` page, and print preview shows equivalent
  pagination

#### Scenario: Login cards per type
- **WHEN** print login cards runs for word/picture/email sections
- **THEN** cards contain the same fields as legacy for each type

### Requirement: Discovery gate and non-pixel parity gates
Implementation SHALL begin with behavior-scenario discovery from the legacy
oracles (SectionLoginInfo story/jest coverage, component sources,
`teacher_homepage_v2.feature` login-cards path) and expose discovered
scenarios as visible dev-shell choices (floor: the six login types, demo
section tooltip state, error). No pixel gate (non-DSCO legacy JSX); gates
are behavior, en-US copy, axe + keyboard, print-preview checks, and
desktop/laptop responsiveness (instructions and imagery reflow at common
desktop widths, 200% zoom, split-screen, narrow laptop; tablet/mobile
parity NOT required). This tab needs no new wrappers — it reads the
shell's selected-section DashboardApi payload; the parent-letter route
reuses the same core wrapper. Its entry lazy-loads outside the shell
chunk.
Design-system mapping (recorded here, executed by the modernization pass):
`legacySharedComponents/Button` → MUI Button; hardcoded `color`/
`fontConstants` styling → SCSS modules with semantic tokens; SafeMarkdown →
`@code-dot-org/markdown` (done in the move); headings → MUI Typography;
print layouts keep their print-specific CSS.

#### Scenario: Discovery recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence and coverage is in the task log
  and the dev-shell selector exposes one scenario per login type
