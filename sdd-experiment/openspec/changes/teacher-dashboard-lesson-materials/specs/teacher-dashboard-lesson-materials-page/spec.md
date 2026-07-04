# Spec: teacher-dashboard-lesson-materials-page

## ADDED Requirements

### Requirement: Materials tab at parity
The candidate route SHALL render the ported lesson-materials tab at
`/frontend-studio/teacher_dashboard/sections/:sectionId/materials`: unit
resources dropdown, per-lesson resource rows (icons, links, view-options
dropdown), custom lesson resources, and the no-curriculum empty state when
the section has neither courseVersionName nor courseOfferingId.

#### Scenario: Populated unit
- **WHEN** the candidate tab renders a section assigned a unit with lesson
  resources
- **THEN** lessons, resources, icons, and dropdown actions match the legacy
  tab for the same unit

#### Scenario: No curriculum
- **WHEN** the section has no curriculum assignment
- **THEN** the materials empty state renders as legacy

### Requirement: AITA lesson summaries port under their gate
The candidate SHALL fetch and render AITA lesson summaries for the
selected lesson exactly as legacy when DCDO `show-aita-lesson-summaries`
is on and the unit is AIF-eligible (`unit_in_aif`); with the flag off or
the unit ineligible, no summary UI renders. Both arms are parity targets.

#### Scenario: Summary shown when eligible
- **WHEN** the flag is on, the unit is in AIF, and a summary exists for the
  selected lesson
- **THEN** the summary renders as legacy; pending/absent states match the
  legacy state machine

### Requirement: AI podcasts port under both gating paths
The candidate SHALL render the lesson podcast experience when EITHER DCDO
`ai-lesson-summary-podcasts` is on OR experiment `ai-lesson-podcasts` is
enabled (the legacy OR at `LessonMaterialsContainer.tsx:227`), and not
otherwise. Generation triggers fired on assignment change are re-expressed
with legacy behavior (`teacherSectionsRedux.js:1132-1143`) as the oracle.

#### Scenario: Podcast via DCDO arm
- **WHEN** only the DCDO key is on
- **THEN** podcasts render as legacy

#### Scenario: Podcast via experiment arm
- **WHEN** only the experiment is enabled
- **THEN** podcasts render identically (OR semantics preserved)

### Requirement: AI artifact resources port under their experiment
With experiment AI_ARTIFACT enabled, custom lesson resources SHALL include
the AI artifact entries with the legacy analytics event on open
(`AI_ARTIFACT_OPEN_FROM_RESOURCES`); with it off, none render.

#### Scenario: Artifact entry gated
- **WHEN** the experiment is on for a lesson with artifact resources
- **THEN** the entries render and clicking one emits the legacy event name

### Requirement: Typed data path and discovery gate
The tab's data SHALL flow through typed wrappers with recorded-JSON
schemata and MSW handlers for `/dashboardapi/lesson_materials/:unit_id`
and `unit_in_aif` (bad unit id = 404 pinned by a parser/contract test).
Implementation begins with behavior-scenario discovery
(`lesson_materials_eyes.feature`, component sources, AITA/podcast state
machines) exposed as visible dev-shell choices (floor: populated,
no-curriculum, aita-summary, podcast-dcdo, podcast-experiment,
ai-artifact, error).

#### Scenario: Discovery recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence and the distinct flag
  combinations is in the task log and the dev-shell selector

### Requirement: Materials visual parity is pixel-gated
Implementation SHALL capture legacy baselines and candidate checkpoints via
the shell harness — this is a DSCO-era TSX surface — for: the populated
resources list, the unit dropdown open state, the no-curriculum empty
state, and the AITA summary and podcast regions (gates on). Captures use
`http://localhost-studio.code.org:9000` with serving-checkout validated;
Playwright MCP MAY be used during implementation;
`lesson_materials_eyes.feature` is the legacy visual oracle.

#### Scenario: Resources list pixel diff
- **WHEN** the harness compares the populated resources list under pinned
  flags with declared masks
- **THEN** the region-scoped diff is within threshold or fails with the
  diff image attached
