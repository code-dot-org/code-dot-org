## ADDED Requirements

### Requirement: Components move verbatim in tiers with seam-only edits
The `teacherHomepageV2` component tree SHALL move (`git mv`) into
`frontend/packages/teacher-dashboard/src/home/` in tiers (leaf → small-seam →
Redux-entangled), each PR using the two-commit discipline: commit 1
byte-identical move citing source SHA; commit 2+ restricted to seam edits
(import repointing, English strings, flag/analytics seams). Redux-entangled
components SHALL keep their `useAppSelector`/thunk code unchanged apart from
import lines.

#### Scenario: Seam edits cause zero pixel change
- **WHEN** a tier's commit 2+ lands
- **THEN** the tier's visual baselines captured after commit 1 pass with zero
  pixel delta

#### Scenario: Apps consumes each moved tier back
- **WHEN** a tier moves
- **THEN** the corresponding apps files are replaced by imports of the package
  (portal dependency), the apps copies are deleted, and the production page
  renders the packaged components unchanged

### Requirement: Behavior parity with the legacy page
The moved home page SHALL render every state the legacy page renders — section
list (active/archived), empty homepage, alerts, coteacher invite, onboarding
checklist, promotions, drawer, popups — with identical behavior; the one-time
side-by-side parity audit against the legacy page SHALL be recorded in the PR
for legacy-reachable states.

#### Scenario: No-sections teacher
- **WHEN** the current user has no sections
- **THEN** the empty homepage renders with the same calls to action as the
  legacy page

#### Scenario: Established teacher
- **WHEN** sections exist across login types
- **THEN** the section grid, card affordances, and options menus match the
  legacy page per login type and ownership (owned/coteacher/provider-synced)

### Requirement: Seams are explicit host contracts
The module SHALL render English strings (with `notranslate` on user-generated
content: section names, student names, join codes), SHALL read DCDO/experiment
flags only as booleans from a typed host interface, SHALL report analytics only
through a `reportEvent(name, payload)` seam (stub until the analytics plugin
lands), and SHALL stub cross-tree dependencies (AI FAB, NPS, tours,
GlobalEditionWrapper) behind package-local seams while apps keeps the real
implementations.

#### Scenario: Flags come from the host
- **WHEN** the host contract sets an onboarding flag off
- **THEN** the onboarding checklist does not render, with no DCDO/experiments
  import anywhere in the package

#### Scenario: User-generated content is not translated
- **WHEN** a section name renders anywhere in the module
- **THEN** its element carries `notranslate`/`data-notranslate`
