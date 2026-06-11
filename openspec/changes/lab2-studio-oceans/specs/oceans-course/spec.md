# oceans-course

## ADDED Requirements

### Requirement: Oceans adapter maps level properties to lab props
A Studio-side adapter SHALL render `OceansLab` with `mode` →
`appMode`, `guides` → `guides`, the active locale →
`textToSpeechLocale`, and a host-provided `onContinue`. Each level
SHALL render a fresh lab instance in the lab's 16:9 frame.

#### Scenario: Each fish mode renders
- **WHEN** the user visits positions 2, 3, 4, 6, and 8
- **THEN** `OceansLab` renders with `appMode` `fishvtrash`,
  `creaturesvtrashdemo`, `creaturesvtrash`, `short`, `long`
  respectively

### Requirement: Video levels are stubbed
Levels with `appName: "standalone_video"` SHALL render a placeholder
showing the level title with a continue affordance wired to the
completion flow.

#### Scenario: Video stub continues the progression
- **WHEN** the user visits position 1
- **THEN** the stub shows the level title and continue reports the
  milestone and navigates to position 2

### Requirement: Full course run-through
An anonymous user SHALL be able to complete all eight levels in
sequence in MSW mode and in Vite Rails mode. Completing the final
level SHALL navigate to the level's `finishUrl` (full page).

#### Scenario: Eight-level run, MSW
- **WHEN** an anonymous user continues through each level in MSW
  mode
- **THEN** all eight levels render in order and finishing level 8
  leaves the SPA via the finish URL

#### Scenario: Rails mode records UserLevel
- **WHEN** a signed-in user completes level 2 against local Rails
- **THEN** a `UserLevel` row exists for that user/level
